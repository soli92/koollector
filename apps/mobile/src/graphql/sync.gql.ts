import { gql } from "@apollo/client";

export const PUSH_EVENTS = gql`
  mutation Push($input: PushEventsInput!) {
    pushEvents(input: $input) {
      serverCursor
      acks { eventId status reason }
    }
  }
`;

export const PULL_CHANGES = gql`
  query Pull($input: PullChangesInput!) {
    pullChanges(input: $input) {
      nextCursor
      changes {
        collectionId
        entityType
        entityId
        op
        payload
        serverTs
        serverCursor
      }
    }
  }
`;
