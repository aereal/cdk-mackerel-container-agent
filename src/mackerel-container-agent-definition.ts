import {
  ContainerDefinition,
  ContainerDefinitionProps,
  ContainerImage,
} from "@aws-cdk/aws-ecs"
import { Construct } from "@aws-cdk/cdk"
import { guessPlatform } from "./guess-platform"
import { ServiceRole } from "./types"

export interface Props
  extends Pick<
    ContainerDefinitionProps,
    Exclude<keyof ContainerDefinitionProps, "image">
  > {
  apiKey: string
  roles?: ReadonlyArray<ServiceRole>
  ignoreContainer?: string
}

export class MackerelContainerAgentDefinition extends ContainerDefinition {
  constructor(parent: Construct, id: string, props: Props) {
    const {
      apiKey,
      roles,
      ignoreContainer,
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

    super(parent, id, {
      ...restProps,
      environment,
      image: ContainerImage.fromDockerHub(
        "mackerel/mackerel-container-agent:latest"
      ),
      taskDefinition,
    })

    taskDefinition.addVolume({
      host: { sourcePath: "/cgroup" }, // TODO: support AL2
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
