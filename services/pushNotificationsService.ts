/* eslint-disable no-console */
import { Expo, ExpoPushMessage, ExpoPushSuccessTicket, ExpoPushTicket, ExpoPushToken } from 'expo-server-sdk';
import { ID } from '../types';
import userService from './userService';

const expo = new Expo();

type PushMessage = Omit<ExpoPushMessage, 'to'>;

const sendNotification = async (userIds: ID[], message: PushMessage) => {
    try {
        const tokens = await userService.getUsersPushTokens(userIds);
        sendPushNotifications(tokens, message);
    } catch(e) {
        console.error('Pushnotifikaation lähetys epäonnistui!\n', e);
    }
};
const handleBadToken = (token: ExpoPushToken) => {
    console.warn('Poistetaan token', token);
    userService.removePushToken(token);
};
const sendPushNotifications = async (pushTokens: ExpoPushToken[], message: PushMessage) => {
    // Tehdään viestit joissa on vastaanottaja
    const messagesWithTokens: ExpoPushMessage[] = [{
        to: pushTokens,
        ...message,
    }];
    const tickets = await expo.sendPushNotificationsAsync(messagesWithTokens);
    // Lisätään kuitteihin pushtoken, jotta se voidaan poistaa virheiden varalta
    const ticketsAndTokens = tickets.map((r, i) => {
        return {
            ...r,
            token: pushTokens[i],
        };
    });

    // Tarkastetaan kuitit 30sek päästä virheiden varalta
    setTimeout(() => {
        checkReceipts(ticketsAndTokens);
    }, 3000);
};
const checkReceipts = async (tickets: ((ExpoPushTicket) & { token?: string })[]) => {
    console.info('Tarkastetaan tiketit');
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
export default { sendPushNotifications, sendNotification }
