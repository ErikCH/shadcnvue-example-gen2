export function request(ctx) {
  const { todos = [] } = ctx.args;

  const prompt = `I have these tasks to do: ${todos.join(",")}.
    What are 10 things I can do to complete these tasks?
    Respond with tasks 1-10 and your complete steps should not be repeated.
    `;

  return {
    resourcePath: `/model/anthropic.claude-v2/invoke`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        prompt: `\n\nHuman:${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 300,
        temperature: 0.2,
        // top_k: 250,
        // top_p: 1,
        stop_sequences: ["\\n\\nHuman:"],
      },
    },
  };
}

export function response(ctx) {
  return {
    body: ctx.result.body,
  };
}
