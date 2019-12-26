import {
  ContainerDefinition,
  ContainerDefinitionProps,
  ContainerImage
} from "@aws-cdk/aws-ecs";
import { Construct } from "@aws-cdk/core";
import {
  MackerelContainerPlatform,
  MackerelHostStatus,
  ServiceRole
} from "./types";

export interface Props extends Omit<ContainerDefinitionProps, "image"> {
  apiKey: string;
  roles?: readonly ServiceRole[];
  ignoreContainer?: string;
  hostStatusOnStart?: MackerelHostStatus;
  image?: ContainerImage;
}

export const MackerelContainerAgentImage = {
  Latest: ContainerImage.fromRegistry(
    "mackerel/mackerel-container-agent:latest"
  ),
  Plugins: ContainerImage.fromRegistry(
    "mackerel/mackerel-container-agent:plugins"
  )
};

export class MackerelContainerAgentDefinition extends ContainerDefinition {
  constructor(parent: Construct, id: string, props: Props) {
    const {
      apiKey,
      roles,
      ignoreContainer,
      hostStatusOnStart,
      image,
      taskDefinition,
      ...restProps
    } = props;

    const environment: Record<string, string> = {
      ...(props && props.environment ? props.environment : {}),
      MACKEREL_APIKEY: apiKey,
      MACKEREL_CONTAINER_PLATFORM: "ecs"
    };

    const containerImage = image || MackerelContainerAgentImage.Latest;

    if (roles) {
      environment.MACKEREL_ROLES = roles
        .map(({ role, service }) => `${service}:${role}`)
        .join(",");
    }

    if (ignoreContainer) {
      environment.MACKEREL_IGNORE_CONTAINER = ignoreContainer;
    }

    if (hostStatusOnStart) {
      environment.MACKEREL_HOST_STATUS_ON_START = hostStatusOnStart;
    }

    super(parent, id, {
      memoryLimitMiB: 128,
      ...restProps,
      environment,
      image: containerImage,
      taskDefinition
    });
  }
}
