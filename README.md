[![Build Status](https://travis-ci.org/aereal/cdk-mackerel-container-agent.png?branch=master)][travis]

# cdk-mackerel-container-agent

:warning: This library is still experimental because underlying [AWS CDK][aws-cdk] is in developer preview release.

cdk-mackerel-container-agent provides helper function that adds [mackerel-container-agent][] to your ECS/EKS task definition.

## Synopsis

```typescript
import {
  AwsLogDriver,
  Cluster,
  ContainerImage,
  Ec2Service,
  Ec2TaskDefinition,
  Protocol,
} from "@aws-cdk/aws-ecs";

const taskDef = new Ec2TaskDefinition(this, "TaskDefinition", {});

addMackerelContainerAgent({
  apiKey: "YOUR_MACKEREL_APIKEY",
  ignoreContainer: `mackerel`,
  platform: MackerelContainerPlatform.ECS,
  roles: [{ service: "My-service", role: "api" }],
  taskDefinition: taskDef,
});

// now `taskDef` configured well to run mackerel-container-agent
```

[travis]: https://travis-ci.org/aereal/cdk-mackerel-container-agent
[aws-cdk]: https://github.com/awslabs/aws-cdk
[mackerel-container-agent]: https://github.com/mackerelio/mackerel-container-agent
