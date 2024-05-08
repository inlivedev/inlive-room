import type { Preview } from "@storybook/react";
import { values } from "lodash-es";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'zinc-950',
      values:[
        {
          name: 'zinc-950',
          value: '#18181B'
        }
      ]
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
