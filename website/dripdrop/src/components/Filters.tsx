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

// Define the types for your filter categories and filters
type Filters = {
    color: { black: boolean; white: boolean; red: boolean };
    brand: { nike: boolean; adidas: boolean; gucci: boolean };
    season: { summer: boolean; winter: boolean; spring: boolean; fall: boolean };
    occasion: { casual: boolean; formal: boolean; sport: boolean };
};

const Filter = () => {
    const [filters, setFilters] = useState<Filters>({
        color: { black: false, white: false, red: false },
        brand: { nike: false, adidas: false, gucci: false },
        season: { summer: false, winter: false, spring: false, fall: false },
        occasion: { casual: false, formal: false, sport: false },
    });

    // Provide explicit types for category and filter
    const handleFilterChange = <T extends keyof Filters>(category: T, filter: keyof Filters[T]) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [category]: {
                ...prevFilters[category],
                [filter]: !prevFilters[category][filter],
            },
        }));
    };

    const applyFilters = () => {
        console.log('Filters applied:', filters);
    };

    return (
        <Box sx={{mx:2}}
        >

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

            {/* Accordion for Season */}
            <Accordion sx={{ border: 'none', boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Season</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControlLabel
                        control={<Checkbox checked={filters.season.summer} onChange={() => handleFilterChange('season', 'summer')} />}
                        label="Summer"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.season.winter} onChange={() => handleFilterChange('season', 'winter')} />}
                        label="Winter"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.season.spring} onChange={() => handleFilterChange('season', 'spring')} />}
                        label="Spring"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={filters.season.fall} onChange={() => handleFilterChange('season', 'fall')} />}
                        label="Fall"
                    />
                </AccordionDetails>
            </Accordion>

            <Divider/>

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
            <Divider/>

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
