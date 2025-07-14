import React from 'react';
import AsyncSelect from 'react-select/async';
import { cn } from '@/lib/utils';

export interface SelectOption {
    id: number | string;
    name: string;
    [key: string]: any;
}

interface CustomAsyncSelectProps {
    id?: string;
    value: SelectOption | null;
    loadOptions: (inputValue: string, callback: (options: SelectOption[]) => void) => void;
    onChange: (option: SelectOption | null) => void;
    placeholder?: string;
    className?: string;
    getOptionLabel?: (option: SelectOption) => string;
    getOptionValue?: (option: SelectOption) => string;
    isClearable?: boolean;
    cacheOptions?: boolean;
    defaultOptions?: boolean;
    hideDropdownIndicator?: boolean;
    menuPlacement?: 'auto' | 'bottom' | 'top';
}

const CustomAsyncSelect: React.FC<CustomAsyncSelectProps> = ({
    id,
    value,
    loadOptions,
    onChange,
    placeholder = 'Ketik untuk mencari...',
    className,
    getOptionLabel = (option) => option.name,
    getOptionValue = (option) => String(option.id) as string,
    isClearable = false,
    cacheOptions = true,
    defaultOptions = true,
    hideDropdownIndicator = false,
    menuPlacement = 'auto',
}) => {
    return (
        <AsyncSelect
            id={id}
            cacheOptions={cacheOptions}
            defaultOptions={defaultOptions}
            loadOptions={loadOptions}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            isClearable={isClearable}
            noOptionsMessage={({ inputValue }) =>
                inputValue.length < 2 ? 'Ketik minimal 2 karakter' : 'Tidak ditemukan'
            }
            loadingMessage={() => 'Mencari...'}
            className={cn('react-select-container', className)}
            classNamePrefix='react-select'
            menuPortalTarget={document.body}
            menuPosition="absolute"
            menuPlacement={menuPlacement}
            menuShouldScrollIntoView={false}
            components={{
                DropdownIndicator: hideDropdownIndicator ? () => null : undefined,
                IndicatorSeparator: hideDropdownIndicator ? () => null : undefined,
            }}
            styles={{
                menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                }),
                menu: (base, state) => ({
                    ...base,
                    zIndex: 9999,
                    // Tambahkan max-height yang responsif berdasarkan placement
                    maxHeight: state.placement === 'top' ? 
                        Math.min(280, window.innerHeight * 0.45) : 
                        Math.min(350, window.innerHeight * 0.5),
                }),
            }}
            theme={(theme) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                    ...theme.colors,
                    primary: '#0ea5e9', // sky-500
                    primary75: '#38bdf8', // sky-400
                    primary50: '#7dd3fc', // sky-300
                    primary25: '#e0f2fe', // sky-100
                },
            })}
        />
    );
};

export default CustomAsyncSelect; 