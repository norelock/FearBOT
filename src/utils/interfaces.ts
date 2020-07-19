import TeamSpeak, { TeamSpeakServer } from "ts3-nodejs-library";

export interface InstanceFeatureConfig {
    channel_id?: string;
    channel_name?: string;
    channel_description?: string;
    ignored_groups?: string[];
    admin_groups?: string[];
    server_name?: string;
    channels?: {
        enabled: boolean;
        channel_name: string;
        channel_id: string;
        group_id: string;
        time_spent: string;
    }[];
    away_time?: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
}

export interface InstanceFeature {
    name: string;
    enabled: boolean;
    config: InstanceFeatureConfig;
    interval?: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
}

export interface InstanceConfig {
    id: number;
    name: string;
    default_channel: number;
    plugins: InstanceFeature[];
    events: InstanceFeature[];
}

export type FearBotInstance = {
    connectionConfig: TeamSpeak.ConnectionParams;
    instanceId: number;
    instanceName: string;
    instanceConfig: InstanceConfig;
};