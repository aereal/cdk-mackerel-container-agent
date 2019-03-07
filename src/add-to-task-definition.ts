import {
  AwsLogDriver,
  Compatibility,
  ContainerDefinition,
  ContainerImage,
  LogDriver,
  NetworkMode,
  TaskDefinition,
} from "@aws-cdk/aws-ecs"
import { ILogGroup } from "@aws-cdk/aws-logs"
import { MackerelContainerPlatform, ServiceRole } from "./types"

interface Props {
  taskDefinition: TaskDefinition
  apiKey: string
  roles?: ReadonlyArray<ServiceRole>
  ignoreContainer?: string
  logGroup?: ILogGroup
}

const guessPlatform = (
  taskDefinition: TaskDefinition
): MackerelContainerPlatform | undefined => {
  switch (taskDefinition.networkMode) {
    case NetworkMode.AwsVpc:
      return taskDefinition.compatibility === Compatibility.Ec2
        ? MackerelContainerPlatform.AWSVPC
        : MackerelContainerPlatform.FARGATE
    case NetworkMode.Bridge:
    case NetworkMode.None:
    case NetworkMode.Host:
      return MackerelContainerPlatform.ECS
    default:
      return undefined
  }
}

export const addMackerelContainerAgent = (
  props: Props
): ContainerDefinition => {
  const { apiKey, taskDefinition, roles, ignoreContainer, logGroup } = props
  const guessedPlatform = guessPlatform(taskDefinition)
  if (!guessedPlatform) {
    throw new Error("Cannot guess platform from taskDefinition")
  }

  const environment: Record<string, string> = {
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
  let logging: LogDriver | undefined
  if (logGroup) {
    logging = new AwsLogDriver(
      taskDefinition,
      "MackerelContainerAgentLogDriver",
      { streamPrefix: "mackerel", logGroup }
    )
  }
  const mackerelAgentContainer = taskDefinition.addContainer("mackerel-agent", {
    environment,
    essential: false,
    image: ContainerImage.fromDockerHub(
      "mackerel/mackerel-container-agent:latest"
    ),
    logging,
    memoryReservationMiB: 128,
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
