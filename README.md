[![Build Status](https://travis-ci.org/aereal/cdk-mackerel-container-agent.png?branch=master)][travis]

# cdk-mackerel-container-agent

:warning: This library is still experimental because underlying [AWS CDK][aws-cdk] is in developer preview release.

cdk-mackerel-container-agent provides helper function that adds [mackerel-container-agent][] to your ECS/EKS task definition.

## Synopsis

```typescript
import { MackerelContainerAgentDefinition } from "@aereal/cdk-mackerel-container-agent";
import { Ec2TaskDefinition } from "@aws-cdk/aws-ecs";
import { Stack } from "@aws-cdk/cdk";

const stack = new Stack();
const taskDefinition = new Ec2TaskDefinition(stack, "TaskDefinition", {});

new MackerelContainerAgentDefinition(stack, 'mackerel-container-agent', {
  apiKey: 'keep-my-secret',
  taskDefinition,
})

// now `taskDef` configured well to run mackerel-container-agent
```

[travis]: https://travis-ci.org/aereal/cdk-mackerel-container-agent
[aws-cdk]: https://github.com/awslabs/aws-cdk
[mackerel-container-agent]: https://github.com/mackerelio/mackerel-container-agent
