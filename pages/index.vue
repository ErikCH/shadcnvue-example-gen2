<template>
  <div class="flex flex-col items-center p-8">
    <h1 class="text-4xl mb-4">Todo Helper</h1>
    <form @submit.prevent="onSubmit" class="flex flex-col items-center">
      <Input v-model="todo" />
      <Button type="submit" class="mt-4">Add</Button>
    </form>
  </div>
  <div class="flex flex-col items-center mb-4">
    <Button @click="onClickSuggestions" class="bg-green-500" :disabled="loading"
      >How To Complete Tasks</Button
    >
    <div class="space-y-2 my-4" v-if="loading">
      <Skeleton class="h-4 w-[500px]" />
      <Skeleton class="h-4 w-[500px]" />
      <Skeleton class="h-4 w-[500px]" />
      <Skeleton class="h-4 w-[500px]" />
    </div>
  </div>
  <Card v-if="suggestions.completion" class="w-1/2 m-auto my-4">
    <CardHeader>
      <div v-html="suggestions.completion" class="whitespace-pre-wrap"></div>
    </CardHeader>
  </Card>
  <div class="flex flex-col gap-4">
    <div v-for="todo in todos" :key="todo.id" class="w-1/2 m-auto">
      <Card>
        <CardHeader>
          <div class="flex justify-between items-center">
            <div class="text-blue-600 text-2xl">{{ todo.content }}</div>
            <Button class="bg-red-500" @click="onClickDelete(todo.id)"
              >X</Button
            >
          </div>
        </CardHeader>
        <CardDescription class="flex flex-col items-center my-4">
          Notes...
        </CardDescription>

        <CardFooter class="text-xs text-gray-400 flex justify-end">
          {{ todo.id }}
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
<script setup lang="ts">
const todo = ref("");
const loading = ref(false);
const suggestions = ref({ completion: "" });
const { $Amplify } = useNuxtApp();
import * as query from "@/src/graphql/queries";
import * as mutations from "@/src/graphql/mutations";

const { data: todos, refresh } = useAsyncData(async () => {
  const result = await $Amplify.GraphQL.client.graphql({
    query: query.listTodos,
  });
  console.log("result", result?.data);
  return result.data.listTodos.items;
});

const onClickSuggestions = async () => {
  if (todos.value!.length === 0) return;
  loading.value = true;
  const { data: suggestion, errors } = await $Amplify.GraphQL.client.graphql({
    query: query.askBedrock,
    variables: {
      todos: [...(todos.value! as [])],
    },
  });
  loading.value = false;
  suggestions.value = JSON.parse(suggestion.askBedrock?.body!) as {
    completion: string;
  };
  console.log("data", suggestion);
  console.log("errors", errors);
};

const onSubmit = async () => {
  if (!todo.value) return;
  console.log("todo.value", todo.value);
  const { data, errors } = await $Amplify.GraphQL.client.graphql({
    query: mutations.createTodo,
    variables: {
      input: { content: todo.value },
    },
  });
  console.log("result", data);
  todo.value = "";
  refresh();
};

const onClickDelete = async (id: string) => {
  const { data, errors } = await $Amplify.GraphQL.client.graphql({
    query: mutations.deleteTodo,
    variables: {
      input: { id },
    },
  });
  refresh();
};
</script>
