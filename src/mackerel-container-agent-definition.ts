import { AmazonLinuxGeneration } from "@aws-cdk/aws-ec2"
import {
  ContainerDefinition,
  ContainerDefinitionProps,
  ContainerImage,
} from "@aws-cdk/aws-ecs"
import { Construct } from "@aws-cdk/cdk"
import {
  MackerelContainerPlatform,
  MackerelHostStatus,
  ServiceRole,
} from "./types"

export interface Props extends Omit<ContainerDefinitionProps, "image"> {
  apiKey: string
  roles?: ReadonlyArray<ServiceRole>
  ignoreContainer?: string
  hostStatusOnStart?: MackerelHostStatus
}

export class MackerelContainerAgentDefinition extends ContainerDefinition {
  constructor(parent: Construct, id: string, props: Props) {
    const {
      apiKey,
      roles,
      ignoreContainer,
      hostStatusOnStart,
      taskDefinition,
      ...restProps
    } = props

    const environment: Record<string, string> = {
      ...(props && props.environment ? props.environment : {}),
      MACKEREL_APIKEY: apiKey,
      MACKEREL_CONTAINER_PLATFORM: "ecs",
    }

    if (roles) {
      environment.MACKEREL_ROLES = roles
        .map(({ role, service }) => `${service}:${role}`)
        .join(",")
    }

    if (ignoreContainer) {
      environment.MACKEREL_IGNORE_CONTAINER = ignoreContainer
    }

    if (hostStatusOnStart) {
      environment.MACKEREL_HOST_STATUS_ON_START = hostStatusOnStart
    }

    super(parent, id, {
      memoryLimitMiB: 128,
      ...restProps,
      environment,
      image: ContainerImage.fromRegistry(
        "mackerel/mackerel-container-agent:latest"
      ),
      taskDefinition,
    })
  }
}
