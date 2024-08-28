'use client';

import { useMemo,useState } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  ButtonGroup,
  Button,
} from '@nextui-org/react';
import type { Selection } from '@nextui-org/react';
import LayoutIcon from '@/_shared/components/icons/layout-icon';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';

export default function ButtonLayout() {

	type LayoutOptions = {
		key: string
		label: string
	}

	const layoutOptions:LayoutOptions[] = [
		{ key: 'auto', label: 'Auto' },
		{ key: 'gallery', label: 'Gallery' },
		{ key: 'presentation', label: 'Presentation' },
	];

	const [layout,setLayout] = useState<string>('auto');


  const onLayoutSelectionChange = (selectedKey: Selection) => {
    if (!(selectedKey instanceof Set) || selectedKey.size === 0) return;

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
	setLayout(selectedKey.currentKey);
      //@ts-ignore
	console.log('layout:',selectedKey.currentKey)
	document.dispatchEvent(new CustomEvent('layout-changed', {
		detail: {
			//@ts-ignore
			layout: selectedKey.currentKey
		}
	}));
  };

  const selectedKeys = [layout]

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
        <DropdownMenu
          disallowEmptySelection
          aria-label="Layout options"
          selectionMode="single"
		  selectedKeys={selectedKeys}
          onSelectionChange={onLayoutSelectionChange}
        >
           {layoutOptions.map((item) => (
			  <DropdownItem key={item.key} description={
				item.key === layout
				
				  ? 'Currently in use'
				  : 'Switch to this layout'
			  }>{item.label}</DropdownItem>
			))}
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  );
}
