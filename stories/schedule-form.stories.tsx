import MeetingScheduleForm from "@/_features/meeting/schedule-form";
import { Meta, StoryObj } from "@storybook/react";
import 'app/_shared/styles/tailwind.css'

const meta : Meta<typeof MeetingScheduleForm> = {
    title: 'ScheduleForm',
    parameters: {

    },
    component : MeetingScheduleForm
    };

export default meta

type Story = StoryObj<typeof MeetingScheduleForm>

export const Primary: Story = {
    render: () => <MeetingScheduleForm />,
  };
  