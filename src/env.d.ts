declare namespace App {
  interface Locals {
    /** Server-resolved anonymous demo session. Never read from the request body. */
    visitorId: string;
  }
}
