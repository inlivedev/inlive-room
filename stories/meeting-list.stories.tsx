// Import the necessary dependencies
import React from 'react';
import { StoryObj, Meta } from '@storybook/react';

// Import the component
import MeetingList from '@/_features/meeting/meeting-list';

// Define the component's story
export default {
    title: 'Components/MeetingList',
    component: MeetingList,
} as Meta;

// Define the Template for the component
type Story = StoryObj<typeof MeetingList>;

// Define the Default story
export const Primary : Story = {
    render: () => (
        <MeetingList 
            events={[
                {
                    categoryID: 1,
                    description: 'First meeting of the year',
                    id: 1,
                    name: 'First meeting of the yearFirst meeting of the yearFirst meeting of the yearFirst meeting of the yearFirst meeting of the yearFirst meeting of the year',
                    uuid: 'a1b2c3',
                    slug: 'meeting-1',
                    startTime: new Date(), // Current time
                    endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
                    createdAt: new Date('2022-01-01T00:00:00'),
                    updatedAt: new Date('2022-01-01T00:00:00'),
                    createdBy: 123,
                    roomId: 'asd',
                    thumbnailUrl: null,
                    deletedAt: null,
                    status: 'draft',
                    maximumSlots: 100,
                },
                {
                    categoryID: 1,
                    description: 'First meeting of the year',
                    id: 1,
                    name: 'Meeting 1',
                    uuid: 'a1b2c3',
                    slug: 'meeting-1',
                    startTime: new Date(), // Current time
                    endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
                    createdAt: new Date('2022-01-01T00:00:00'),
                    updatedAt: new Date('2022-01-01T00:00:00'),
                    createdBy: 123,
                    roomId: 'asd',
                    thumbnailUrl: null,
                    deletedAt: null,
                    status: 'draft',
                    maximumSlots: 100,
                },
                {
                    categoryID: 1,
                    description: 'Second meeting of the year',
                    id: 2,
                    name: 'Meeting 2',
                    uuid: 'd4e5f6',
                    slug: 'meeting-2',
                    startTime: new Date(), // Current time
                    endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
                    createdAt: new Date('2022-01-01T00:00:00'),
                    updatedAt: new Date('2022-01-01T00:00:00'),
                    createdBy: 456,
                    roomId: 'asds',
                    thumbnailUrl: null,
                    deletedAt: null,
                    status: 'draft',
                    maximumSlots: 100,
                },
            ]}
        />
    ),
}