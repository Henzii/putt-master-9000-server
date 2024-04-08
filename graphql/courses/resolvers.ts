import queries from './queries';
import mutations from './mutations';
import { ContextWithUser, Course, Layout } from '../../types';
import { getDistance } from 'geolib';
import { calculateHc } from '../../utils/calculateHc';

type InfoWithCoordinates = {
    variableValues: {
        coordinates: [number, number]
    }
}

type LayoutStatsRoot = {
    scores: number[][],
    pars: number[]
}

export default {
    ...queries,
    ...mutations,

    Layout: {
        par: (root: Layout) => {
            return root.pars.reduce((p, c) => (p + c), 0);
        },
        canEdit: (root: Layout, args: unknown, context: ContextWithUser) => {
            return context.user.id === root.creator?.toString() || context.user.id == root.courseCreator?.toString();
        }
    },
    Course: {
        layouts: (root: Course) => {
            return root.layouts.map(layout => {
                layout.courseCreator = root.creator;
                return layout;
            });
        },
        canEdit: (root: Course, args: unknown, context: ContextWithUser) => {
            return context.user.id === root.creator?.toString();
        },
        distance: (root: Course, args: unknown, context: unknown, info: InfoWithCoordinates) => {
            try {
                const [lon1, lat1] = root.location.coordinates;
                const [lon2, lat2] = info.variableValues.coordinates;
                const distance = getDistance(
                    { latitude: lat1, longitude: lon1 },
                    { latitude: lat2, longitude: lon2 }
                );
                return {
                    meters: distance,
                    string: (distance > 10000)
                        ? Math.floor(distance / 1000) + ' km'
                        : (distance < 1000)
                            ? distance + ' m'
                            : Math.round(distance / 1000 * 10) / 10 + ' km'
                };
            } catch (e) {
                return { meters: 0, string: '' };
            }
        }
    },
    LayoutStats: {
        best: (root: LayoutStatsRoot) => {
            return root.scores.reduce((p, c) => {
                const total = c.reduce((sum, score) => sum + score, 0);
                if (!p || total < p) return total;
                return p;
            }, 0);
        },
        hc: (root: LayoutStatsRoot) => {
            const sumTable = root.scores.slice(-10).reduce((p, c) => {
                return [...p, c.reduce((sum, score) => sum + score, 0)];
            }, []);
            const hc = calculateHc(root.pars, sumTable);
            return hc;
        }
    },
};