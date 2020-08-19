import { DocumentNode, GraphQLSchema } from 'graphql';
import { getComplexity } from 'graphql-query-complexity';

interface Option {
  /**
   * name of list fields
   */
  fields: string[];
  /**
   * max skip size
   */
  maxSkipSize: number;
  /**
   * max row * column
   */
  maxFieldSize: number;

  /**
   * default list size
   */
  defaultListSize: number;
}

class ErrorReporter {
  #errors: string[] = [];

  push(message: string) {
    this.#errors.push(message);
  }

  getErrors(): string[] {
    return this.#errors;
  }

  hasError(): boolean {
    return this.#errors.length > 0;
  }
}

export class ComplexityCalculator<V> {
  private readonly limitationFields: Set<string>;

  constructor(private schema: GraphQLSchema, private options: Option) {
    this.limitationFields = new Set(options.fields);
  }

  calc(query: DocumentNode, variables: V): string | undefined {
    const { maxSkipSize, maxFieldSize, defaultListSize } = this.options;
    const limitationFields = this.limitationFields;

    const reporter = new ErrorReporter();
    const complexity = getComplexity({
      query,
      schema: this.schema,
      variables,
      estimators: [
        (options) => {
          const fieldName = options.field.name;

          const limit =
            options.args.first ?? options.args.last ?? defaultListSize;
          const skip = options.args.skip ?? 0;

          if (skip > maxSkipSize) {
            reporter.push(
              `The maximum skip size is ${maxSkipSize}, skip ${skip} "${fieldName}" is not allowed`,
            );
          }

          if (!limitationFields.has(fieldName)) return options.childComplexity;

          return limit
            ? (options.childComplexity || 1) * limit
            : options.childComplexity || 1;
        },
      ],
    });

    if (complexity > maxFieldSize) {
      reporter.push(
        `The query exceeds the maximum cost of ${maxFieldSize}, actual cost ${complexity}`,
      );
    }

    if (reporter.hasError()) return reporter.getErrors().join('\n');
  }
}
