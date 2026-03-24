export const typeDefs = `#graphql
  scalar JSON

  type Query {
    health: String!
    pullChanges(input: PullChangesInput!): PullChangesResult!
  }

  type Mutation {
    pushEvents(input: PushEventsInput!): PushEventsResult!
  }

  type Subscription {
    ping: String!
  }

  input PushEventInput {
    eventId: String!
    collectionId: String!
    entityType: String!
    entityId: String!
    op: String!
    payload: JSON
    clientTs: String!
    actorUserId: String!
  }

  input PushEventsInput {
    deviceId: String!
    events: [PushEventInput!]!
  }

  type PushAck {
    eventId: String!
    status: String!
    reason: String
  }

  type PushEventsResult {
    serverCursor: String!
    acks: [PushAck!]!
  }

  input PullChangesInput {
    deviceId: String!
    sinceCursor: String!
    collectionIds: [String!]!
  }

  type PulledChange {
    collectionId: String!
    entityType: String!
    entityId: String!
    op: String!
    payload: JSON
    serverTs: String!
    serverCursor: String!
  }

  type PullChangesResult {
    nextCursor: String!
    changes: [PulledChange!]!
  }
`;
