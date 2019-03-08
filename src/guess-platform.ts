import { Compatibility, NetworkMode, TaskDefinition } from "@aws-cdk/aws-ecs"
import { MackerelContainerPlatform } from "./types"

export const guessPlatform = (
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
