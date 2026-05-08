import { GraphQLError } from "graphql";
import type { GraphQLResolveInfo } from "graphql";
import { getDistance } from "geolib";
import { weekliesRateLimiter } from "../rateLimiter";
import type { ContextWithUser } from "../../types";

const METRIX_BASE = "https://discgolfmetrix.com/api.php";
const DEFAULT_MAX_DISTANCE = 50000;

type GetWeekliesArgs = {
  coordinates: [number, number];
  maxDistance?: number;
  date?: string;
  countryCode?: string;
};

type MetrixCompetition = {
  ID: string;
  Name: string;
  Date: string;
  Time: string;
  PlayersCount: string;
  CourseName: string;
  CourseID: string | null;
};

type MetrixCourse = {
  Lat: string;
  Lng: string;
};

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

async function fetchCourseCoords(
  courseId: string,
  apiKey: string,
): Promise<MetrixCourse | null> {
  try {
    const url = `${METRIX_BASE}?content=course&id=${courseId}&code=${apiKey}`;
    const res = await fetch(url);
    const data = (await res.json()) as { course?: MetrixCourse };
    if (!data.course?.Lat || !data.course?.Lng) return null;
    return data.course;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("Error fetching course coords\n", e);
    return null;
  }
}

export const competitionsQueries = {
  Query: {
    getWeekliesNearMe: async (
      parent: unknown,
      args: GetWeekliesArgs,
      context: ContextWithUser,
      info: GraphQLResolveInfo,
    ) => {
      if (
        await weekliesRateLimiter(
          { parent, args, context, info },
          { max: 10, window: "1m" },
        )
      ) {
        throw new GraphQLError("Rate limit exceeded. Try again later.");
      }

      const apiKey = process.env.DISCGOLFMETRIX_API_KEY;
      if (!apiKey) throw new GraphQLError("Metrix API key not configured.");

      const countryCode = args.countryCode ?? "FI";
      const date = args.date ?? formatDate(new Date());
      const maxDistance = args.maxDistance ?? DEFAULT_MAX_DISTANCE;
      const [lng, lat] = args.coordinates;

      const url = `${METRIX_BASE}?content=competitions&code=${apiKey}&country_code=${countryCode}&country=${countryCode}&date1=${date}&date2=${date}`;
      try {
        const res = await fetch(url);
        const data = (await res.json()) as {
          Competitions?: MetrixCompetition[];
        };

        const competitions = (data.Competitions ?? []).filter(
          (c) => parseInt(c.PlayersCount, 10) >= 10,
        );

        const withCoords = await Promise.all(
          competitions.map(async (c) => {
            if (!c.CourseID) return null;
            const course = await fetchCourseCoords(c.CourseID, apiKey);
            if (!course) return null;
            const distance = getDistance(
              { latitude: lat, longitude: lng },
              {
                latitude: parseFloat(course.Lat),
                longitude: parseFloat(course.Lng),
              },
            );
            if (distance > maxDistance) return null;
            return c;
          }),
        );
        return withCoords
          .filter((c): c is MetrixCompetition => c !== null)
          .map((c) => ({
            id: c.ID,
            name: c.Name.replace(/&rarr;/g, "->"),
            date: c.Date,
            time: c.Time,
            playerCount: parseInt(c.PlayersCount, 10),
            courseName: c.CourseName.replace(/&rarr;/g, "->"),
            courseId: c.CourseID,
          }));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("Error fetching competitions\n", e);
        throw new GraphQLError("Error fetching competitions.");
      }
    },
  },
};
