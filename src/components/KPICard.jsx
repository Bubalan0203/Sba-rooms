import React from 'react';
import { Card, CardContent, Avatar, Chip, Box, Typography, useTheme } from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const KPICard = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}1A 0%, ${color}05 100%)`,
          border: `1px solid ${color}30`,
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: 120, sm: 140, md: 160 },
          '&:hover': {
            boxShadow: theme.shadows[8],
            borderColor: color,
          },
        }}
      >
        <CardContent sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }, 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1, sm: 2 } }}>
            <Avatar
              sx={{
                bgcolor: `${color}20`,
                color: color,
                width: { xs: 40, sm: 48, md: 56 },
                height: { xs: 40, sm: 48, md: 56 },
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
                }
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip
                icon={<TrendingUpIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                label={trend}
                size="small"
                sx={{
                  bgcolor: `${theme.palette.success.main}20`,
                  color: theme.palette.success.main,
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 }
                }}
              />
            )}
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: { xs: 0.5, sm: 1 },
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' },
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                lineHeight: 1.3
              }}
            >
              {title}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KPICard;