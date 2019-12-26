export enum MackerelContainerPlatform {
  KUBERNETES = "kubernetes", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/kubernetes
  ECS = "ecs" // https://mackerel.io/ja/docs/entry/howto/install-agent/container/ecs
}

export interface ServiceRole {
  role: string;
  service: string;
}

export enum MackerelHostStatus {
  Working = "working",
  Standby = "standby",
  Maintenance = "maintenance",
  Poweroff = "poweroff"
}
