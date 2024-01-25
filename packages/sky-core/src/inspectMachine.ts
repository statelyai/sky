import PartySocket from 'partysocket';
// export const inspectionMachine = createMachine({
//   /** @xstate-layout N4IgpgJg5mDOIC5QEsB2sAOYDGAXZA9qgHTIQA2YAxLLgIYBOuA2gAwC6ioGBsy+RLiAAeiAIwAWAGzEJAZmkBOAExyAHMrVjlAVgA0IAJ6ItxHQF9zBtJhwCSuABZoA1mig1KYDG05IQPHz2QqIIylKKxGpyihIA7HE6MaxSugbGCJISltboWHiEJLBeGO40uAQ+HEKB-IUh4nJxUTHxicmp+kaIyqw6xLqWViCoBBBwQjb5wf61M6ChALRS6YjLOSBTdoWkFGA1vHWC-qESyqsIphbDWwVExE6u7gdB9Sc9cWIDKlKsuh1pbqXL7XXK2O5FErPWaHeYiHo6ZrRWIJJKKFKAjK9bJDIA */
//   id: 'inspection',
//   initial: 'idle',
//   states: {
//     idle: {
//       on: {
//         start: 'thinking',
//       },
//     },

//     thinking: {
//       on: {
//         sleep: 'sleeping',
//       },
//     },

//     sleeping: {
//       on: {
//         stop: 'idle',
//       },
//     },
//   },
// });

// console.log('inspectionMachine');
// const { host, apiBaseURL } = skyConnectionInfo();

export function connectTest() {
  const partySocket = new PartySocket({
    host: 'http://localhost:1999',
    room: 'inspect',
  });
  partySocket.onopen = () => {
    console.log('onopen');
  };
}

// const { inspect } = createInspector({ apiKey: 'my-api-key' }) as any;

// const actor = createActor(inspectionMachine, {
//   inspect,
// });
// // actor.start();
// // printState();
// // actor.send({ type: 'start' });
// // printState();

// function printState() {
//   console.log(actor.getSnapshot().value);
// }
