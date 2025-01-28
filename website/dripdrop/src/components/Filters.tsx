import React, { useState, useEffect, useRef } from 'react';
import { Filters } from '../types'
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

    const drawerRef = useRef<HTMLDivElement | null>(null);

    const closeFilterDrawer = () => {
        console.log("Before close Filter Drawer: " + isFilterOpen);
        setFilterOpen(false);
        console.log("Filter: " + JSON.stringify(filters));
        console.log("After close Filter Drawer: " + isFilterOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
        };

        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen, setFilterOpen]);


    return (
        <Drawer ref={drawerRef} anchor="right" open={isFilterOpen} onClose={closeFilterDrawer}>
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
                                    onChange={() => setFilters((prev) => ({
                                        ...prev,
                                        color: { ...prev.color, black: !prev.color.black }
                                    }))}
                                />
                            }
                            label="Black"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.color.white}
                                    onChange={() => setFilters((prev) => ({
                                        ...prev,
                                        color: { ...prev.color, white: !prev.color.white }
                                    }))}
                                />
                            }
                            label="White"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.color.red}
                                    onChange={() => setFilters((prev) => ({
                                        ...prev,
                                        color: { ...prev.color, red: !prev.color.red }
                                    }))}
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
                                    onChange={() => setFilters((prev) => ({
                                        ...prev,
                                        brand: { ...prev.brand, nike: !prev.brand.nike }
                                    }))}
                                />
                            }
                            label="Nike"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.brand.adidas}
                                    onChange={() => setFilters((prev) => ({
                                        ...prev,
                                        brand: { ...prev.brand, adidas: !prev.brand.adidas }
                                    }))}
                                />
                            }
                            label="Adidas"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.brand.gucci}
                                    onChange={() => setFilters((prev) => ({
                                        ...prev,
                                        brand: { ...prev.brand, gucci: !prev.brand.gucci }
                                    }))}
                                />
                            }
                            label="Gucci"
                        />
                    </AccordionDetails>
                </Accordion>

                <Divider />

                {/* Accordion for Price */}
                <Accordion sx={{ border: 'none', boxShadow: 'none' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Price</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography gutterBottom>Price Range</Typography>
                        <Slider
                            value={[filters.price.min, filters.price.max]}
                            onChange={(e, newValue) => {
                                if (Array.isArray(newValue)) {
                                    setFilters((prev) => ({
                                        ...prev,
                                        price: { min: newValue[0], max: newValue[1] }
                                    }));
                                }
                            }}
                            min={0}
                            max={300}
                            step={10}
                            valueLabelDisplay="auto"
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <TextField
                                label="Min Price"
                                type="number"
                                value={filters.price.min}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        price: { ...prev.price, min: Number(e.target.value) }
                                    }))
                                }
                                fullWidth
                            />
                            <TextField
                                label="Max Price"
                                type="number"
                                value={filters.price.max}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        price: { ...prev.price, max: Number(e.target.value) }
                                    }))
                                }
                                fullWidth
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Divider />

                <Button variant="contained" color="primary" onClick={closeFilterDrawer} sx={{ width: '100%', mt: 2 }}>
                    Apply Filters
                </Button>
            </Box>
        </Drawer>
    );
};

export default Filter;


