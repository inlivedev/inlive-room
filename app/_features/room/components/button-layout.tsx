'use client';

import { useState } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  ButtonGroup,
  Button,
} from '@nextui-org/react';
import { clientSDK } from '@/_shared/utils/sdk';
import type { Selection } from '@nextui-org/react';
import LayoutIcon from '@/_shared/components/icons/layout-icon';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { useClientContext } from '@/_features/room/contexts/client-context';

type LayoutOptions = {
  key: string;
  label: string;
};

export default function ButtonLayout() {
  const { isModerator, currentLayout } = useMetadataContext();

  const { roomID } = useClientContext();

  const layoutOptions: LayoutOptions[] = [
    { key: 'gallery', label: 'Gallery' },
    { key: 'speaker', label: 'Speaker' },
    { key: 'multispeakers', label: 'Multi Speakers' },
  ];

  const moderatorLayoutOptions: LayoutOptions[] = [
    { key: 'gallery-all', label: 'Gallery' },
    { key: 'speaker-all', label: 'Speaker' },
    { key: 'multispeakers-all', label: 'Multi Speakers' },
  ];

  const [layout, setLayout] = useState<string>(currentLayout);

  const onLayoutSelectionChange = async (selectedKey: Selection) => {
    if (!(selectedKey instanceof Set) || selectedKey.size === 0) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const newLayout = selectedKey.currentKey;
    setLayout(newLayout);
    //@ts-ignore
    console.log('layout:', selectedKey.currentKey);

    if (newLayout.includes('all')) {
      await clientSDK.setMetadata(roomID, {
        previousLayout: currentLayout,
        //@ts-ignore
        currentLayout: newLayout.split('-')[0],
      });
    } else {
      document.dispatchEvent(
        new CustomEvent('layout-changed', {
          detail: {
            //@ts-ignore
            layout: selectedKey.currentKey,
          },
        })
      );
    }
  };

  const selectedKeys = [layout];

  const moderatorOptionsRender = () => (
    <DropdownMenu
      disallowEmptySelection
      aria-label="Layout options"
      selectionMode="single"
      selectedKeys={selectedKeys}
      onSelectionChange={onLayoutSelectionChange}
    >
      <DropdownSection title="Layout for everyone" showDivider>
        {moderatorLayoutOptions.map((item) => (
          <DropdownItem
            key={item.key}
            description={
              item.key === layout ? 'Currently in use' : 'Switch to this layout'
            }
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownSection>
      <DropdownSection title="Layout for you only" showDivider>
        {layoutOptions.map((item) => (
          <DropdownItem
            key={item.key}
            description={
              item.key === layout ? 'Currently in use' : 'Switch to this layout'
            }
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownSection>
    </DropdownMenu>
  );
  const nonModeratorOptionsRender = () => (
    <DropdownMenu
      disallowEmptySelection
      aria-label="Layout options"
      selectionMode="single"
      selectedKeys={selectedKeys}
      onSelectionChange={onLayoutSelectionChange}
    >
      {layoutOptions.map((item) => (
        <DropdownItem
          key={item.key}
          description={
            item.key === layout ? 'Currently in use' : 'Switch to this layout'
          }
        >
          {item.label}
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
  return (
    <ButtonGroup variant="flat">
      <Dropdown placement="bottom" className=" ring-1 ring-zinc-800/70">
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="flat"
            aria-label="Change Layout"
            className="w-12 bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
          >
            <LayoutIcon width={20} height={20} />
            <ArrowDownFillIcon className="h-3.5 w-3.5" />
          </Button>
        </DropdownTrigger>
        {isModerator ? moderatorOptionsRender() : nonModeratorOptionsRender()}
      </Dropdown>
    </ButtonGroup>
  );
}
