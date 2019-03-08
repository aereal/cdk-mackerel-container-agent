import {
  ContainerDefinition,
  ContainerImage,
  TaskDefinition,
} from "@aws-cdk/aws-ecs"
import { guessPlatform } from "./guess-platform"
import { AdditionalContainerDefinitionOptions, ServiceRole } from "./types"

interface Props {
  taskDefinition: TaskDefinition
  apiKey: string
  roles?: ReadonlyArray<ServiceRole>
  ignoreContainer?: string
  additionalContainerOptions?: AdditionalContainerDefinitionOptions
}

export const addMackerelContainerAgent = (
  props: Props
): ContainerDefinition => {
  const {
    apiKey,
    taskDefinition,
    roles,
    ignoreContainer,
    additionalContainerOptions: opts,
  } = props
  const guessedPlatform = guessPlatform(taskDefinition)
  if (!guessedPlatform) {
    throw new Error("Cannot guess platform from taskDefinition")
  }

  const environment: Record<string, string> = {
    ...(opts && opts.environment ? opts.environment : {}),
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
  const mackerelAgentContainer = taskDefinition.addContainer("mackerel-agent", {
    ...opts,
    environment,
    image: ContainerImage.fromDockerHub(
      "mackerel/mackerel-container-agent:latest"
    ),
  })
  taskDefinition.addVolume({
    host: {
      sourcePath: "/cgroup", // TODO: support AL2
    },
    name: "cgroup",
  })
  mackerelAgentContainer.addMountPoints({
    containerPath: "/host/sys/fs/cgroup",
    readOnly: true,
    sourceVolume: "cgroup",
  })
  taskDefinition.addVolume({
    host: {
      sourcePath: "/var/run/docker.sock",
    },
    name: "docker_sock",
  })
  mackerelAgentContainer.addMountPoints({
    containerPath: "/var/run/docker.sock",
    readOnly: true,
    sourceVolume: "docker_sock",
  })
  return mackerelAgentContainer
}
