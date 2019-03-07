import { Ec2TaskDefinition } from "@aws-cdk/aws-ecs"
import { LogGroup } from "@aws-cdk/aws-logs"
import { Stack } from "@aws-cdk/cdk"
import { addMackerelContainerAgent } from "./add-to-task-definition"
import { MackerelContainerPlatform } from "./types"

describe("addMackerelContainerAgent", () => {
  test("add to task definition with only required props", () => {
    const stack = new Stack()
    const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
    const container = addMackerelContainerAgent({
      apiKey: "keep-my-secret",
      taskDefinition,
    })
    expect(stack.toCloudFormation()).toMatchSnapshot()
  })

  test("with roles", () => {
    const stack = new Stack()
    const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
    const container = addMackerelContainerAgent({
      apiKey: "keep-my-secret",
      roles: [
        { service: "My-service", role: "db" },
        { service: "My-service", role: "proxy" },
      ],
      taskDefinition,
    })
    expect(stack.toCloudFormation()).toMatchSnapshot()
  })

  test("specify ignoreContainer", () => {
    const stack = new Stack()
    const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
    const container = addMackerelContainerAgent({
      apiKey: "keep-my-secret",
      ignoreContainer: "(mackerel|xray)",
      taskDefinition,
    })
    expect(stack.toCloudFormation()).toMatchSnapshot()
  })

  test("specify logGroup", () => {
    const stack = new Stack()
    const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
    const container = addMackerelContainerAgent({
      apiKey: "keep-my-secret",
      logGroup: new LogGroup(stack, "LogGroup"),
      taskDefinition,
    })
    expect(stack.toCloudFormation()).toMatchSnapshot()
  })
})
