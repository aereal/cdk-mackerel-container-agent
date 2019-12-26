import {
  ContainerDefinition,
  ContainerDefinitionProps,
  ContainerImage,
  Secret,
  Scope
} from "@aws-cdk/aws-ecs";
import { Construct } from "@aws-cdk/core";
import { MackerelHostStatus, ServiceRole } from "./types";

export interface Props extends Omit<ContainerDefinitionProps, "image"> {
  apiKey?: Secret;
  unsafeBareAPIKey?: string;
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
      unsafeBareAPIKey,
      roles,
      ignoreContainer,
      hostStatusOnStart,
      image,
      taskDefinition,
      ...restProps
    } = props;

    if (unsafeBareAPIKey === undefined && apiKey === undefined) {
      throw new Error(
        "Either apiKey or unsafeBareAPIKey must be passed (apiKey as Secret highly recommended)"
      );
    }

    if (unsafeBareAPIKey !== undefined && apiKey !== undefined) {
      throw new Error(
        "Just one of either apiKey unsafeBareAPIKey can be passed"
      );
    }

    const environment: Record<string, string> = {
      ...(props && props.environment ? props.environment : {}),
      ...(unsafeBareAPIKey !== undefined
        ? {
            MACKEREL_APIKEY: unsafeBareAPIKey
          }
        : {}),
      MACKEREL_CONTAINER_PLATFORM: "ecs"
    };

    const secrets: Record<string, Secret> = {
      ...props.secrets,
      ...(apiKey !== undefined ? { MACKEREL_APIKEY: apiKey } : {})
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
      secrets,
      taskDefinition
    });

    if (unsafeBareAPIKey !== undefined) {
      this.node.addWarning(
        "unsafeBareAPIKey is deprecated and will be removed at next major version. Please use apiKey: Secret"
      );
    }
  }
}
