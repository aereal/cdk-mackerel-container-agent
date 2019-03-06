import {
  AwsLogDriver,
  ContainerDefinition,
  ContainerImage,
  LogDriver,
  TaskDefinition,
} from "@aws-cdk/aws-ecs";
import { ILogGroup } from "@aws-cdk/aws-logs";

export enum MackerelContainerPlatform {
  KUBERNETES = "kubernetes", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/kubernetes
  FARGATE = "fargate", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/ecsawsvpc
  AWSVPC = "ecs_awsvpc", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/ecsawsvpc
  ECS = "ecs", // https://mackerel.io/ja/docs/entry/howto/install-agent/container/ecs
}

interface ServiceRole {
  role: string;
  service: string;
}

interface Props {
  taskDefinition: TaskDefinition;
  platform: MackerelContainerPlatform;
  apiKey: string;
  roles?: ReadonlyArray<ServiceRole>;
  ignoreContainer?: string;
  logGroup?: ILogGroup;
}

export const addMackerelContainerAgent = (
  props: Props
): ContainerDefinition => {
  const {
    apiKey,
    taskDefinition,
    platform,
    roles,
    ignoreContainer,
    logGroup,
  } = props;
  const environment: Record<string, string> = {
    MACKEREL_APIKEY: apiKey,
    MACKEREL_CONTAINER_PLATFORM: platform,
  };
  if (roles) {
    environment.MACKEREL_ROLES = roles
      .map(({ role, service }) => `${service}:${role}`)
      .join(",");
  }
  if (ignoreContainer) {
    environment.MACKEREL_IGNORE_CONTAINER = ignoreContainer;
  }
  let logging: LogDriver | undefined;
  if (logGroup) {
    logging = new AwsLogDriver(
      taskDefinition,
      "MackerelContainerAgentLogDriver",
      { streamPrefix: "mackerel", logGroup }
    );
  }
  const mackerelAgentContainer = taskDefinition.addContainer("mackerel-agent", {
    environment,
    essential: false,
    image: ContainerImage.fromDockerHub(
      "mackerel/mackerel-container-agent:latest"
    ),
    logging,
    memoryReservationMiB: 128,
  });
  taskDefinition.addVolume({
    host: {
      sourcePath: "/cgroup", // TODO: support AL2
    },
    name: "cgroup",
  });
  mackerelAgentContainer.addMountPoints({
    containerPath: "/host/sys/fs/cgroup",
    readOnly: true,
    sourceVolume: "cgroup",
  });
  taskDefinition.addVolume({
    host: {
      sourcePath: "/var/run/docker.sock",
    },
    name: "docker_sock",
  });
  mackerelAgentContainer.addMountPoints({
    containerPath: "/var/run/docker.sock",
    readOnly: true,
    sourceVolume: "docker_sock",
  });
  return mackerelAgentContainer;
};
