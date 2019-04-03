import { AmazonLinuxGeneration } from "@aws-cdk/aws-ec2"
import {
  ContainerDefinition,
  ContainerDefinitionProps,
  ContainerImage,
} from "@aws-cdk/aws-ecs"
import { Construct } from "@aws-cdk/cdk"
import { guessPlatform } from "./guess-platform"
import {
  MackerelContainerPlatform,
  MackerelHostStatus,
  ServiceRole,
} from "./types"

export interface Props
  extends Pick<
    ContainerDefinitionProps,
    Exclude<keyof ContainerDefinitionProps, "image">
  > {
  apiKey: string
  roles?: ReadonlyArray<ServiceRole>
  ignoreContainer?: string
  hostStatusOnStart?: MackerelHostStatus
  generation?: AmazonLinuxGeneration
}

export class MackerelContainerAgentDefinition extends ContainerDefinition {
  constructor(parent: Construct, id: string, props: Props) {
    const {
      apiKey,
      roles,
      ignoreContainer,
      hostStatusOnStart,
      generation,
      taskDefinition,
      ...restProps
    } = props

    const guessedPlatform = guessPlatform(taskDefinition)
    if (!guessedPlatform) {
      throw new Error("Cannot guess platform from taskDefinition")
    }

    const environment: Record<string, string> = {
      ...(props && props.environment ? props.environment : {}),
      MACKEREL_APIKEY: apiKey,
      MACKEREL_CONTAINER_PLATFORM: guessedPlatform,
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
      ...restProps,
      environment,
      image: ContainerImage.fromRegistry(
        "mackerel/mackerel-container-agent:latest"
      ),
      taskDefinition,
    })

    if (guessedPlatform === MackerelContainerPlatform.ECS) {
      const sourcePath =
        !generation || generation === AmazonLinuxGeneration.AmazonLinux
          ? "/cgroup"
          : "/sys/fs/cgroup"

      taskDefinition.addVolume({
        host: { sourcePath },
        name: "cgroup",
      })
      this.addMountPoints({
        containerPath: "/host/sys/fs/cgroup",
        readOnly: true,
        sourceVolume: "cgroup",
      })

      taskDefinition.addVolume({
        host: { sourcePath: "/var/run/docker.sock" },
        name: "docker_sock",
      })
      this.addMountPoints({
        containerPath: "/var/run/docker.sock",
        readOnly: true,
        sourceVolume: "docker_sock",
      })
    }
  }
}
