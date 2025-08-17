import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Star as StarIcon,
  Wifi as WifiIcon,
  LocalParking as ParkingIcon,
  Restaurant as RestaurantIcon,
  FitnessCenter as GymIcon,
  Pool as PoolIcon,
  RoomService as ServiceIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedCard from '../components/AnimatedCard';
import ResponsiveLayout from '../components/ResponsiveLayout';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const features = [
    { icon: <WifiIcon />, title: 'Free WiFi', description: 'High-speed internet in all rooms' },
    { icon: <ParkingIcon />, title: 'Free Parking', description: 'Complimentary parking for all guests' },
    { icon: <RestaurantIcon />, title: '24/7 Dining', description: 'Room service available round the clock' },
    { icon: <ServiceIcon />, title: 'Concierge', description: 'Dedicated guest services' },
    { icon: <GymIcon />, title: 'Fitness Center', description: 'Modern gym facilities' },
    { icon: <PoolIcon />, title: 'Swimming Pool', description: 'Outdoor pool with city views' },
  ];

  const roomTypes = [
    {
      title: 'Deluxe AC Room',
      price: '₹2,500',
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['King Size Bed', 'AC', 'City View', 'Free WiFi'],
      rating: 4.8,
    },
    {
      title: 'Premium Suite',
      price: '₹4,200',
      image: 'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Living Area', 'Kitchenette', 'Balcony', 'Premium Amenities'],
      rating: 4.9,
    },
    {
      title: 'Standard Non-AC',
      price: '₹1,800',
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Comfortable Bed', 'Fan Cooling', 'Garden View', 'Free WiFi'],
      rating: 4.5,
    },
  ];

  return (
    <ResponsiveLayout maxWidth="xl" sx={{ px: 0 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), url("https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1600") center/cover',
          minHeight: { xs: '70vh', md: '80vh' },
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Elements */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1.2, rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        />
        
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    fontWeight: 800,
                    mb: 2,
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  Welcome to
                  <Box component="span" sx={{ color: theme.palette.secondary.main, display: 'block' }}>
                    SBA Rooms
                  </Box>
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Experience luxury and comfort in the heart of the city. 
                  Your perfect stay awaits with world-class amenities and exceptional service.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/booking')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #26a69a 30%, #4db6ac 90%)',
                      boxShadow: '0 6px 20px rgba(38, 166, 154, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #00695c 30%, #26a69a 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(38, 166, 154, 0.5)',
                      },
                    }}
                  >
                    Book Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/rooms')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    View Rooms
                  </Button>
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Luxury Hotel Room"
                    sx={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover',
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            World-Class Amenities
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              mb: 6,
              color: theme.palette.text.secondary,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Enjoy premium facilities designed to make your stay memorable and comfortable
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <AnimatedCard delay={index * 0.1}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: 'white',
                      fontSize: '2rem',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Room Types Section */}
      <Box sx={{ backgroundColor: '#f8fafc', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              Our Room Collection
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{
                mb: 6,
                color: theme.palette.text.secondary,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Choose from our carefully curated selection of rooms, each designed for your comfort
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {roomTypes.map((room, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard delay={index * 0.2}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={room.image}
                    alt={room.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {room.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ color: '#ffc107', fontSize: '1.2rem' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {room.rating}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography
                      variant="h5"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        mb: 2,
                      }}
                    >
                      {room.price}
                      <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                        /night
                      </Typography>
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {room.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.secondary.light + '20',
                            color: theme.palette.secondary.dark,
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/rooms')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3,
              }}
            >
              View All Rooms
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              py: { xs: 6, md: 8 },
              px: 4,
              borderRadius: 4,
            }}
          >
            <CardContent>
              <Typography
                variant="h3"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                }}
              >
                Ready for Your Perfect Stay?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: '600px',
                  mx: 'auto',
                }}
              >
                Book your room today and experience the finest hospitality with modern amenities and exceptional service.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/booking')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  borderRadius: 3,
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Book Your Stay Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </ResponsiveLayout>
  );
};

export default HomePage;