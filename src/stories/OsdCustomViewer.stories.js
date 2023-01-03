import MyMode from "../../lib/OsdCustomViewer.vue";

// More on default export: https://storybook.js.org/docs/vue/writing-stories/introduction#default-export
export default {
  title: "OsdCustomViewer",
  component: MyMode,
  // More on argTypes: https://storybook.js.org/docs/vue/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
    // onClick: {},
    mode: {
      control: { type: "select" },
      options: ["light", "dark"],
    },
  },
};

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { MyMode },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<my-Mode v-bind="args" />',
});

export const Basic = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Basic.args = {
  manifest: "https://www.dl.ndl.go.jp/api/iiif/2567061/manifest.json",
  regions: [
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/68#xywh=50,50,300,300",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/70#xywh=500,500,300,300",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991",
  ],
  page: 69,
  show_all: true
};

export const Minimum = Template.bind({});
Minimum.args = {
  manifest: "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json"
};

export const Dark = Template.bind({});
Dark.args = {
  manifest: "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json",
  mode: "dark"
};
