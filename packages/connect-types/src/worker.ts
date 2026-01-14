export interface Worker {
  id: string;
  name: string;
  queueName: string;
  age: number;
  idle: number;
}

export interface WorkerCount {
  queueName: string;
  count: number;
}
