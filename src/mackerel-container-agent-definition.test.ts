import {
  Ec2TaskDefinition,
  FargateTaskDefinition,
  NetworkMode,
} from "@aws-cdk/aws-ecs"
import { Stack } from "@aws-cdk/cdk"
import { MackerelContainerAgentDefinition } from "./mackerel-container-agent-definition"

describe("MackerelContainerAgentDefinition", () => {
  test("add to task definition with only required props", () => {
    const stack = new Stack()
    const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
    const container = new MackerelContainerAgentDefinition(
      stack,
      "mackerel-container-agent",
      {
        apiKey: "keep-my-secret",
        taskDefinition,
      }
    )
    expect(stack.toCloudFormation()).toMatchSnapshot()
  })

  test("with roles", () => {
    const stack = new Stack()
    const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
    const container = new MackerelContainerAgentDefinition(
      stack,
      "mackerel-container-agent",
      {
        apiKey: "keep-my-secret",
        roles: [
          { service: "My-service", role: "db" },
          { service: "My-service", role: "proxy" },
        ],
        taskDefinition,
      }
    )
    expect(stack.toCloudFormation()).toMatchSnapshot()
  })

  test("specify ignoreContainer", () => {
    const stack = new Stack()
    const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
    const container = new MackerelContainerAgentDefinition(
      stack,
      "mackerel-container-agent",
      {
        apiKey: "keep-my-secret",
        ignoreContainer: "(mackerel|xray)",
        taskDefinition,
      }
    )
    expect(stack.toCloudFormation()).toMatchSnapshot()
  })

  test("volumes are not mounted when awsvpc / fargate", () => {
    const stack = new Stack()
    const taskDefinitionAwsVpc = new Ec2TaskDefinition(
      stack,
      "TaskDefinitionAwsVpc",
      {
        networkMode: NetworkMode.AwsVpc,
      }
    )
    const containerAwsVpc = new MackerelContainerAgentDefinition(
      stack,
      "mackerel-container-agent-awsvpc",
      {
        apiKey: "keep-my-secret",
        taskDefinition: taskDefinitionAwsVpc,
      }
    )
    const taskDefinitionFargate = new FargateTaskDefinition(
      stack,
      "TaskDefinitionFargate",
      {}
    )
    const containerFargate = new MackerelContainerAgentDefinition(
      stack,
      "mackerel-container-agent-fargate",
      {
        apiKey: "keep-my-secret",
        taskDefinition: taskDefinitionFargate,
      }
    )
    expect(stack.toCloudFormation()).toMatchSnapshot()
  })
})
