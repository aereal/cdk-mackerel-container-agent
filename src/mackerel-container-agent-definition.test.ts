import { Ec2TaskDefinition } from "@aws-cdk/aws-ecs"
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
})
