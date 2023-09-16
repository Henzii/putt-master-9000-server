/* eslint-disable no-console */
import { Expo, ExpoPushMessage, ExpoPushSuccessTicket, ExpoPushTicket, ExpoPushToken } from 'expo-server-sdk';
import { ID } from '../types';
import { validUser } from '../utils/validators';
import userService from './userService';
import { GraphQLError } from 'graphql';

const expo = new Expo({ accessToken: process.env.PUSH_ACCESS_TOKEN });

type PushMessage = Omit<ExpoPushMessage, 'to'>;

const sendNotification = async (userIds: ID[], message: PushMessage) => {
    try {
        const tokens = await userService.getUsersPushTokens(userIds);
        sendPushNotifications(tokens, message);
    } catch(e) {
        console.log('Pushnotifikaation lähetys epäonnistui!\n', e);
    }
};
const handleBadToken = (token: ExpoPushToken) => {
    console.log('Poistetaan token', token);
    userService.removePushToken(token);
};
const sendPushNotifications = async (pushTokens: ExpoPushToken[], message: PushMessage) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Push notifikaatiota ei lähetetty koska DEV mode');
        console.log(`${message.title} / ${message.body}`);
        return;
    }
    // Filteröidään vialliset pushTokenit pois
    const validPushTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));

    if (validPushTokens.length < 1) return;

    // Tehdään viestit joissa on vastaanottaja
    const messagesWithTokens: ExpoPushMessage[] = [{
        to: validPushTokens,
        ...message,
        priority: 'high',
    }];
    try {
        const tickets = await expo.sendPushNotificationsAsync(messagesWithTokens);
        // Lisätään kuitteihin pushtoken, jotta se voidaan poistaa virheiden varalta
        const ticketsAndTokens = tickets.map((r, i) => {
            return {
                ...r,
                token: validPushTokens[i],
            };
        });

        // Tarkastetaan kuitit 30sek päästä virheiden varalta
        setTimeout(() => {
            checkReceipts(ticketsAndTokens);
        }, 30000);
    } catch {
        console.log('Push notifikaatiota ei voitu lähettää');
    }
};
const checkReceipts = async (tickets: ((ExpoPushTicket) & { token?: string })[]) => {
    for (const ticket of tickets) {
        const id = (ticket as ExpoPushSuccessTicket).id;

        // Jos lipulla ei ole id:tä
        if (!id) continue;

        const receipts = await expo.getPushNotificationReceiptsAsync([id]);
        const receipt = receipts[id];
        if (receipt.status === 'error') {
            console.error('Error tiketissä', id, receipt.message);
            if (receipt.details && receipt.details.error) {
                // Jos laitetta ei ole rekisteröity, handlataan/poistetaan token
                console.error(receipt.details.error);
                if (receipt.details.error === 'DeviceNotRegistered' && ticket.token) {
                    handleBadToken(ticket.token);
                }
            }
        }
    }
};
const sendNotificationToAllFriends = async (userId: ID, message: PushMessage) => {
    const user = await userService.getUser(undefined, userId);
    if (!user) throw new GraphQLError(`User with id ${userId} not found`);
    // Populoidaan ystävät
    await user.populate('friends');
    const tokenArray= user.friends.map(f => {
        if (!validUser(f)) return;
        return f.pushToken;
    });
    console.log(tokenArray);
};
export default { sendNotification, sendNotificationToAllFriends };
