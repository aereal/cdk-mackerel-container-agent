import { SynthUtils } from "@aws-cdk/assert"
import { AmazonLinuxGeneration } from "@aws-cdk/aws-ec2"
import {
  Ec2TaskDefinition,
  FargateTaskDefinition,
  NetworkMode,
} from "@aws-cdk/aws-ecs"
import { Stack } from "@aws-cdk/cdk"
import { MackerelContainerAgentDefinition } from "./mackerel-container-agent-definition"
import { MackerelHostStatus } from "./types"

describe("MackerelContainerAgentDefinition", () => {
  describe("EC2", () => {
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
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
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
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
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
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
    })

    test("with Amazon Linux 2", () => {
      const stack = new Stack()
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: "keep-my-secret",
          generation: AmazonLinuxGeneration.AmazonLinux2,
          taskDefinition,
        }
      )
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
    })

    test("with hostStatusOnStart", () => {
      const stack = new Stack()
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {})
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: "keep-my-secret",
          hostStatusOnStart: MackerelHostStatus.Working,
          taskDefinition,
        }
      )
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
    })
  })

  describe("EC2 (awsvpc)", () => {
    test("add to task definition", () => {
      const stack = new Stack()
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {
        networkMode: NetworkMode.AwsVpc,
      })
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: "keep-my-secret",
          taskDefinition,
        }
      )
      expect(container.mountPoints).toHaveLength(0)
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
    })
  })

  describe("Fargate", () => {
    test("add to task definition", () => {
      const stack = new Stack()
      const taskDefinition = new FargateTaskDefinition(
        stack,
        "TaskDefinition",
        {}
      )
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: "keep-my-secret",
          taskDefinition,
        }
      )
      expect(container.mountPoints).toHaveLength(0)
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
    })
  })
})
