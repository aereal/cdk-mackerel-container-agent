import { ContainerDefinition, TaskDefinition } from "@aws-cdk/aws-ecs"
import { Construct } from "@aws-cdk/cdk"
import { MackerelContainerAgentDefinition } from "./mackerel-container-agent-definition"
import { AdditionalContainerDefinitionOptions, ServiceRole } from "./types"

interface Props {
  taskDefinition: TaskDefinition
  apiKey: string
  roles?: ReadonlyArray<ServiceRole>
  ignoreContainer?: string
  additionalContainerOptions?: AdditionalContainerDefinitionOptions
  parent: Construct
}

export const addMackerelContainerAgent = (
  props: Props
): ContainerDefinition => {
  const { additionalContainerOptions, parent, ...restProps } = props
  return new MackerelContainerAgentDefinition(parent, "mackerel-agent", {
    ...additionalContainerOptions,
    ...restProps,
  })
}
