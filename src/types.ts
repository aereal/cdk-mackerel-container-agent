export enum MackerelContainerPlatform {
  KUBERNETES = "kubernetes", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/kubernetes
  FARGATE = "fargate", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/ecsawsvpc
  AWSVPC = "ecs_awsvpc", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/ecsawsvpc
  ECS = "ecs", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/ecs
}

export interface ServiceRole {
  role: string
  service: string
}
