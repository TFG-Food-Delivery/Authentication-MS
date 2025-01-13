export abstract class Step<T, R> {
  name: string;
  abstract invoke(params: T, context: Record<string, any>): Promise<R>;
  abstract withCompensation(
    params: T,
    context: Record<string, any>,
  ): Promise<R>;
}
