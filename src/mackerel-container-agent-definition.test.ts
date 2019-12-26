import { SynthUtils } from "@aws-cdk/assert";
import { Secret as SecretsManagerSecret } from "@aws-cdk/aws-secretsmanager";
import {
  ContainerImage,
  Ec2TaskDefinition,
  FargateTaskDefinition,
  NetworkMode,
  Secret
} from "@aws-cdk/aws-ecs";
import { Stack } from "@aws-cdk/core";
import {
  MackerelContainerAgentDefinition,
  MackerelContainerAgentImage
} from "./mackerel-container-agent-definition";
import { MackerelHostStatus } from "./types";

describe("MackerelContainerAgentDefinition", () => {
  describe("Common", () => {
    const errorMessage =
      "Either apiKey or unsafeBareAPIKey must be passed (apiKey as Secret highly recommended)";

    test("neither apiKey nor unsafeBareAPIKey passed", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      expect(
        () =>
          new MackerelContainerAgentDefinition(
            stack,
            "mackerel-container-agent",
            { taskDefinition }
          )
      ).toThrowError(errorMessage);
    });

    test("only apiKey passed", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      expect(
        () =>
          new MackerelContainerAgentDefinition(
            stack,
            "mackerel-container-agent",
            {
              taskDefinition,
              apiKey: Secret.fromSecretsManager(
                SecretsManagerSecret.fromSecretArn(
                  stack,
                  "ImportedSecret",
                  "dummy-arn"
                )
              )
            }
          )
      ).not.toThrowError(errorMessage);
    });

    test("only unsafeBareAPIKey passed", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      expect(
        () =>
          new MackerelContainerAgentDefinition(
            stack,
            "mackerel-container-agent",
            {
              taskDefinition,
              unsafeBareAPIKey: "keep-my-secret"
            }
          )
      ).not.toThrowError(errorMessage);
    });
  });

  describe("EC2", () => {
    test("add to task definition with only required props", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      new MackerelContainerAgentDefinition(stack, "mackerel-container-agent", {
        apiKey: Secret.fromSecretsManager(
          SecretsManagerSecret.fromSecretArn(
            stack,
            "ImportedSecret",
            "dummy-arn"
          )
        ),
        taskDefinition
      });
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    test("pass unsafeBareAPIKey", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          unsafeBareAPIKey: "keep-my-secret",
          taskDefinition
        }
      );
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    test("with roles", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: Secret.fromSecretsManager(
            SecretsManagerSecret.fromSecretArn(
              stack,
              "ImportedSecret",
              "dummy-arn"
            )
          ),
          roles: [
            { service: "My-service", role: "db" },
            { service: "My-service", role: "proxy" }
          ],
          taskDefinition
        }
      );
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    test("specify ignoreContainer", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: Secret.fromSecretsManager(
            SecretsManagerSecret.fromSecretArn(
              stack,
              "ImportedSecret",
              "dummy-arn"
            )
          ),
          ignoreContainer: "(mackerel|xray)",
          taskDefinition
        }
      );
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    test("with hostStatusOnStart", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: Secret.fromSecretsManager(
            SecretsManagerSecret.fromSecretArn(
              stack,
              "ImportedSecret",
              "dummy-arn"
            )
          ),
          hostStatusOnStart: MackerelHostStatus.Working,
          taskDefinition
        }
      );
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    test("with customImage", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: Secret.fromSecretsManager(
            SecretsManagerSecret.fromSecretArn(
              stack,
              "ImportedSecret",
              "dummy-arn"
            )
          ),
          image: ContainerImage.fromRegistry(
            "somebody/some-custom-agent-image"
          ),
          taskDefinition
        }
      );
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    test("with `plugins` image", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: Secret.fromSecretsManager(
            SecretsManagerSecret.fromSecretArn(
              stack,
              "ImportedSecret",
              "dummy-arn"
            )
          ),
          image: MackerelContainerAgentImage.Plugins,
          taskDefinition
        }
      );
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });
  });

  describe("EC2 (awsvpc)", () => {
    test("add to task definition", () => {
      const stack = new Stack();
      const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {
        networkMode: NetworkMode.AWS_VPC
      });
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: Secret.fromSecretsManager(
            SecretsManagerSecret.fromSecretArn(
              stack,
              "ImportedSecret",
              "dummy-arn"
            )
          ),
          taskDefinition
        }
      );
      expect(container.mountPoints).toHaveLength(0);
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });
  });

  describe("Fargate", () => {
    test("add to task definition", () => {
      const stack = new Stack();
      const taskDefinition = new FargateTaskDefinition(
        stack,
        "TaskDefinition",
        {}
      );
      const container = new MackerelContainerAgentDefinition(
        stack,
        "mackerel-container-agent",
        {
          apiKey: Secret.fromSecretsManager(
            SecretsManagerSecret.fromSecretArn(
              stack,
              "ImportedSecret",
              "dummy-arn"
            )
          ),
          taskDefinition
        }
      );
      expect(container.mountPoints).toHaveLength(0);
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });
  });
});
