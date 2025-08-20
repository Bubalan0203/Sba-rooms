import styled from 'styled-components';
import { Card, Button, Container } from 'react-bootstrap';

// Breakpoints
const breakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
};

// Media query helper
const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  xxl: `@media (min-width: ${breakpoints.xxl})`
};

// Styled Components
export const StyledContainer = styled(Container)`
  padding: 2rem;
  background: #f1f5f9;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const ResponsiveContainer = styled.div`
  padding: 2rem;
  background: #f1f5f9;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const PageHeader = styled.div`
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: white;
  padding: 3rem 0;
  margin: -2rem -2rem 2rem -2rem;
  border-radius: 0 0 24px 24px;
  
  @media (max-width: 768px) {
    margin: -1rem -1rem 2rem -1rem;
    padding: 2rem 0;
  }
  
  h1, h2 {
    color: white;
    margin-bottom: 0.5rem;
    font-weight: 800;
    font-size: clamp(2rem, 5vw, 3rem);
  }
  
  p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0;
    font-size: clamp(1rem, 2.5vw, 1.2rem);
  }
`;

export const StyledCard = styled(Card)`
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .card-body {
    padding: 1.5rem;
    
    ${media.sm} {
      padding: 2rem;
    }
  }
`;

export const KPICard = styled(StyledCard)`
  text-align: center;
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  
  .card-body {
    padding: 2rem 1rem;
    
    ${media.sm} {
      padding: 2.5rem 1.5rem;
    }
  }
  
  h3 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: white;
    
    ${media.sm} {
      font-size: 3rem;
    }
  }
  
  .kpi-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.9;
    
    ${media.sm} {
      font-size: 3rem;
    }
  }
  
  .kpi-title {
    font-size: 1rem;
    font-weight: 600;
    opacity: 0.95;
    margin-bottom: 0.5rem;
    
    ${media.sm} {
      font-size: 1.1rem;
    }
  }
  
  .kpi-trend {
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    display: inline-block;
  }
`;

export const ActionButton = styled(Button)`
  border-radius: 12px;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${media.sm} {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
`;

export const FloatingActionButton = styled(ActionButton)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  
  ${media.lg} {
    display: none;
  }
  
  svg {
    font-size: 1.5rem;
  }
`;

export const ResponsiveGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  
  ${media.sm} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  ${media.lg} {
    grid-template-columns: repeat(3, 1fr);
  }
  
  ${media.xl} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  margin-bottom: 2rem;
  
  ${media.sm} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  ${media.xl} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const ChartContainer = styled(StyledCard)`
  .card-body {
    padding: 1.5rem;
    
    ${media.sm} {
      padding: 2rem;
    }
  }
  
  h5 {
    color: #1e293b;
    font-weight: 700;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    
    ${media.sm} {
      font-size: 1.5rem;
    }
  }
`;

export const TableContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  .table {
    margin-bottom: 0;
    
    th {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      font-weight: 700;
      color: #374151;
      padding: 1rem;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      
      ${media.sm} {
        padding: 1.25rem;
        font-size: 0.9rem;
      }
    }
    
    td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      
      ${media.sm} {
        padding: 1.25rem;
      }
    }
    
    tbody tr:hover {
      background: #f8fafc;
    }
  }
`;

export const FilterBar = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  
  .row {
    align-items: end;
  }
  
  .form-control, .form-select {
    border-radius: 12px;
    border: 1px solid #d1d5db;
    padding: 0.75rem 1rem;
    
    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
    
    ${media.sm} {
      font-size: 5rem;
    }
  }
  
  h4 {
    color: #374151;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  
  .spinner-border {
    width: 3rem;
    height: 3rem;
    border-width: 0.3em;
  }
`;

export const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &.status-active {
    background: #dcfce7;
    color: #166534;
  }
  
  &.status-completed {
    background: #dbeafe;
    color: #1e40af;
  }
  
  &.status-extended {
    background: #fef3c7;
    color: #92400e;
  }
  
  &.status-available {
    background: #dcfce7;
    color: #166534;
  }
  
  &.status-booked {
    background: #fee2e2;
    color: #dc2626;
  }
`;

export const MobileOptimized = styled.div`
  ${media.sm} {
    display: none;
  }
`;

export const DesktopOptimized = styled.div`
  display: none;
  
  ${media.sm} {
    display: block;
  }
`;

export const FormCard = styled(StyledCard)`
  .card-header {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: white;
    border-radius: 20px 20px 0 0;
    padding: 1.5rem 2rem;
    
    h5 {
      color: white;
      margin: 0;
      font-weight: 700;
    }
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  .form-control, .form-select {
    border-radius: 12px;
    border: 1px solid #d1d5db;
    padding: 0.875rem 1rem;
    transition: all 0.2s ease;
    
    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
`;

export const ModalStyled = styled.div`
  .modal-content {
    border: none;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
  }
  
  .modal-header {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: white;
    border-bottom: none;
    padding: 2rem;
    
    .modal-title {
      color: white;
      font-weight: 700;
      font-size: 1.5rem;
    }
    
    .btn-close {
      filter: invert(1);
      opacity: 0.8;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .modal-body {
    padding: 2rem;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .modal-footer {
    background: #f8fafc;
    border-top: 1px solid #e5e7eb;
    padding: 1.5rem 2rem;
  }
`;