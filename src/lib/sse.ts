// Simple in-memory SSE broadcast for real-time events
// In production, use Redis pub/sub for multi-instance support

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const clients: SSEClient[] = [];

export function addClient(controller: ReadableStreamDefaultController): string {
  const id = crypto.randomUUID();
  clients.push({ id, controller });
  return id;
}

export function removeClient(id: string) {
  const index = clients.findIndex((c) => c.id === id);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

export function broadcastEvent(type: string, data: unknown) {
  const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  clients.forEach((client) => {
    try {
      client.controller.enqueue(encoded);
    } catch {
      removeClient(client.id);
    }
  });
}
