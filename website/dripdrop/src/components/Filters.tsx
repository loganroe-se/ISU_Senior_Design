import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

type Filters = {
    color: { black: boolean; white: boolean; red: boolean };
    brand: { nike: boolean; adidas: boolean; gucci: boolean };
    price: { min: number; max: number };
    occasion: { casual: boolean; formal: boolean; sport: boolean };
};

interface FilterProps {
    isFilterOpen: boolean;
    setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>; 
}

const Filter: React.FC<FilterProps> = ({ isFilterOpen, setFilterOpen }) => {
    const [filters, setFilters] = useState<Filters>({
        color: { black: false, white: false, red: false },
        brand: { nike: false, adidas: false, gucci: false },
        price: { min: 0, max: 100 },
        occasion: { casual: false, formal: false, sport: false },
    });

    useEffect(() => {
        console.log('Component rendered');
    });

    useEffect(() => {
        console.log('Drawer state changed: isFilterOpen =>', isFilterOpen);
    }, [isFilterOpen]);

    const handleFilterChange = <T extends keyof Filters>(
        category: T,
        filter: keyof Filters[T]
    ) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [category]: {
                ...prevFilters[category],
                [filter]: !prevFilters[category][filter],
            },
        }));
    };

    const handlePriceSliderChange = (event: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                price: { min: newValue[0], max: newValue[1] },
            }));
        }
    };

    const [priceError, setPriceError] = useState<string | null>(null);

    const handlePriceInputChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
        const value = Number(event.target.value);
        setFilters((prevFilters) => {
            const updatedPrice = { ...prevFilters.price, [type]: value };

            if (updatedPrice.min > updatedPrice.max) {
                setPriceError('Min price cannot be greater than max price.');
            } else {
                setPriceError(null);
            }

            return { ...prevFilters, price: updatedPrice };
        });
    };

    const closeFilterDrawer = () => {
        setFilterOpen(false); // Correctly call the function to update the state
    };

    return (
        <>
            {isFilterOpen && (
                <Drawer
                    anchor="right"
                    open={isFilterOpen}
                    onClose={() => closeFilterDrawer}
                >
                    <Box sx={{ width: 300, mx: 2 }}>
                        {/* Accordion for Color */}
                        <Accordion sx={{ border: 'none', boxShadow: 'none' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Color</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.color.black}
                                            onChange={() => handleFilterChange('color', 'black')}
                                        />
                                    }
                                    label="Black"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.color.white}
                                            onChange={() => handleFilterChange('color', 'white')}
                                        />
                                    }
                                    label="White"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.color.red}
                                            onChange={() => handleFilterChange('color', 'red')}
                                        />
                                    }
                                    label="Red"
                                />
                            </AccordionDetails>
                        </Accordion>

                        <Divider />

                        {/* Accordion for Brand */}
                        <Accordion sx={{ border: 'none', boxShadow: 'none' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Brand</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.brand.nike}
                                            onChange={() => handleFilterChange('brand', 'nike')}
                                        />
                                    }
                                    label="Nike"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.brand.adidas}
                                            onChange={() => handleFilterChange('brand', 'adidas')}
                                        />
                                    }
                                    label="Adidas"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.brand.gucci}
                                            onChange={() => handleFilterChange('brand', 'gucci')}
                                        />
                                    }
                                    label="Gucci"
                                />
                            </AccordionDetails>
                        </Accordion>

                        <Divider />

                        {/* Accordion for Price Filter */}
                        <Accordion sx={{ border: 'none', boxShadow: 'none' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Price</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography gutterBottom>Price Range</Typography>
                                <Slider
                                    value={[filters.price.min, filters.price.max]}
                                    onChange={handlePriceSliderChange}
                                    min={0}
                                    max={300}
                                    step={10}
                                    valueLabelDisplay="auto"
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <TextField
                                        label="Min Price"
                                        type="number"
                                        value={filters.price.min}
                                        onChange={(e) =>
                                            handlePriceInputChange(e as React.ChangeEvent<HTMLInputElement>, 'min')
                                        }
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        error={!!priceError}
                                        helperText={priceError && 'Min price cannot be greater than max price.'}
                                        fullWidth
                                    />

                                    <TextField
                                        label="Max Price"
                                        type="number"
                                        value={filters.price.max}
                                        onChange={(e) =>
                                            handlePriceInputChange(e as React.ChangeEvent<HTMLInputElement>, 'max')
                                        }
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        error={!!priceError}
                                        helperText={priceError && 'Min price cannot be greater than max price.'}
                                        fullWidth
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Divider />

                        {/* Accordion for Occasion */}
                        <Accordion sx={{ border: 'none', boxShadow: 'none' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Occasion</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.occasion.casual}
                                            onChange={() => handleFilterChange('occasion', 'casual')}
                                        />
                                    }
                                    label="Casual"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.occasion.formal}
                                            onChange={() => handleFilterChange('occasion', 'formal')}
                                        />
                                    }
                                    label="Formal"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.occasion.sport}
                                            onChange={() => handleFilterChange('occasion', 'sport')}
                                        />
                                    }
                                    label="Sport"
                                />
                            </AccordionDetails>
                        </Accordion>

                        <Divider />

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={closeFilterDrawer}
                            sx={{ width: '100%', mt: 2 }}
                        >
                            Apply Filters
                        </Button>
                    </Box>
                </Drawer>
            )}
        </>
    );
};

export default Filter;
