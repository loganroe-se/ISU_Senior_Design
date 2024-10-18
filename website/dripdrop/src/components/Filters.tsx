import React, { useState } from 'react';
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

// Define the types for your filter categories and filters
type Filters = {
    color: { black: boolean; white: boolean; red: boolean };
    brand: { nike: boolean; adidas: boolean; gucci: boolean };
    price: { min: number; max: number };
    occasion: { casual: boolean; formal: boolean; sport: boolean };
};

const Filter = () => {
    const [filters, setFilters] = useState<Filters>({
        color: { black: false, white: false, red: false },
        brand: { nike: false, adidas: false, gucci: false },
        price: { min: 0, max: 100 },  // Set initial values for the price filter
        occasion: { casual: false, formal: false, sport: false },
    });

    // Function to handle checkbox changes
    const handleFilterChange = <T extends keyof Filters>(category: T, filter: keyof Filters[T]) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [category]: {
                ...prevFilters[category],
                [filter]: !prevFilters[category][filter],
            },
        }));
    };


    // Function to handle price change from slider
    const handlePriceSliderChange = (event: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setFilters(prevFilters => ({
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

            // Validation check: min should not be greater than max
            if (updatedPrice.min > updatedPrice.max) {
                setPriceError('Min price cannot be greater than max price.');
            } else {
                setPriceError(null); // Clear error if valid
            }
            return {
                ...prevFilters,
                price: updatedPrice,
            };
        });
    };



    const applyFilters = () => {
        console.log('Filters applied:', filters);
    };

    return (
        <Box sx={{ mx: 2 }}>

            {/* Accordion for Color */}
            <Accordion sx={{ border: 'none', boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Color</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControlLabel
                        control={<Checkbox checked={filters.color.black} onChange={() => handleFilterChange('color', 'black')} />}
                        label="Black"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.color.white} onChange={() => handleFilterChange('color', 'white')} />}
                        label="White"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.color.red} onChange={() => handleFilterChange('color', 'red')} />}
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
                        control={<Checkbox checked={filters.brand.nike} onChange={() => handleFilterChange('brand', 'nike')} />}
                        label="Nike"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.brand.adidas} onChange={() => handleFilterChange('brand', 'adidas')} />}
                        label="Adidas"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.brand.gucci} onChange={() => handleFilterChange('brand', 'gucci')} />}
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
                            onChange={(e) => handlePriceInputChange(e as React.ChangeEvent<HTMLInputElement>, 'min')}
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
                            onChange={(e) => handlePriceInputChange(e as React.ChangeEvent<HTMLInputElement>, 'max')}
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
                        control={<Checkbox checked={filters.occasion.casual} onChange={() => handleFilterChange('occasion', 'casual')} />}
                        label="Casual"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.occasion.formal} onChange={() => handleFilterChange('occasion', 'formal')} />}
                        label="Formal"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.occasion.sport} onChange={() => handleFilterChange('occasion', 'sport')} />}
                        label="Sport"
                    />
                </AccordionDetails>
            </Accordion>

            <Divider />

            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={applyFilters}
            >
                Apply Filters
            </Button>
        </Box>
    );
};

export default Filter;
