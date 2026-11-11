/* eslint-disable no-console */
import axios from 'axios';


const INSTANCE_ID = "1916064";
const url = "https://otlp-gateway-prod-eu-north-0.grafana.net/otlp/v1/logs";

type EventPrefix = 'server' | 'user' | 'course'
type EventName = `${EventPrefix}.${string}`
type LogSeverity = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

const severityNumbers: Record<LogSeverity, number> = {
    TRACE: 1,
    DEBUG: 5,
    INFO: 9,
    WARN: 13,
    ERROR: 17,
    FATAL: 21,
};

export const log = (eventName: EventName, message: string, severity: LogSeverity = 'INFO') => {
    console.log(`[${eventName}]: ${message}`);

    const apiKey = process.env.GRAFANA_TOKEN;
    if (!apiKey) {
        console.error('Cannot send log to Grafana: GRAFANA_TOKEN is not set');
        return;
    }

    const encoded = Buffer.from(`${INSTANCE_ID}:${apiKey}`).toString('base64');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encoded}`,
    };

    const serviceName = process.env.NODE_ENV === 'production' ? 'FuDisc server' : 'Dev FuDisc server';

    const body = {
        resourceLogs: [{
            resource: {
                attributes: [
                    { key: "service.name", value: { stringValue: serviceName } }
                ]
            },
            scopeLogs: [{
                logRecords: [{
                    timeUnixNano: String(Date.now() * 1e6),
                    severityText: severity,
                    severityNumber: severityNumbers[severity],
                    attributes: [
                        { key: "event.name", value: { stringValue: eventName } }
                    ],
                    body: { stringValue: message }
                }]
            }]
        }]
    };

    axios.post(url, JSON.stringify(body), { headers, timeout: 10_000 }).catch(e => {
        console.error('Error sending log to Grafana:', e?.response?.status, e?.response?.data ?? e?.message);
    });
};