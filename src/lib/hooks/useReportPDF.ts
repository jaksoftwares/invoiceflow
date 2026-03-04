'use client';

import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BusinessProfile } from '@/types/database';
import { trackActionAction } from '@/lib/actions/subscription';

interface GenerateReportOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: { header: string; dataKey: string; format?: (val: any, item: any) => string }[];
  businessProfile?: BusinessProfile;
  fileName?: string;
  orientation?: 'p' | 'l';
}

export const useReportPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReportPDF = useCallback(async (options: GenerateReportOptions) => {
    const { title, subtitle, data, columns, businessProfile, fileName, orientation = 'p' } = options;
    
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
      });

      // Add Branding Header
      const margin = 14;
      let y = margin;

      // Business Logo (if available)
      if (businessProfile?.logo_url) {
        try {
          // Attempting to add logo - this might need proxying if CORS is an issue, but let's try
          // doc.addImage(businessProfile.logo_url, 'PNG', margin, y, 20, 20);
          // For now, let's stick to text for reliability if image loading fails
        } catch (e) {
          console.error('Failed to load logo for PDF', e);
        }
      }

      // Business Name
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(businessProfile?.name || 'InvoiceFlow Report', margin, y + 10);
      
      // Business Address (Small)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      const address = `${businessProfile?.address || ''}${businessProfile?.city ? ', ' + businessProfile.city : ''}`;
      doc.text(address, margin, y + 16);
      if (businessProfile?.email || businessProfile?.phone) {
        doc.text(`${businessProfile.email || ''} | ${businessProfile.phone || ''}`, margin, y + 21);
      }

      // Report Title
      y += 35;
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(title.toUpperCase(), margin, y);
      
      if (subtitle) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(subtitle, margin, y + 7);
        y += 12;
      } else {
        y += 8;
      }

      // Divider Line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(margin, y, 210 - margin, y);
      y += 10;

      // Table Data
      const tableHeaders = columns.map(col => col.header);
      const tableData = data.map(item => 
        columns.map(col => col.format ? col.format(item[col.dataKey], item) : item[col.dataKey] || '-')
      );

      autoTable(doc, {
        startY: y,
        head: [tableHeaders],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [15, 23, 42], // slate-900
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [30, 41, 59], // slate-800
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data: any) => {
          // Footer
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184); // slate-400
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
          
          doc.text(
            `Generated on ${new Date().toLocaleString()} - Page ${pageCount}`,
            margin,
            pageHeight - 10
          );
          doc.text(
            'Powered by InvoiceFlow',
            pageWidth - margin - 35,
            pageHeight - 10
          );
        }
      });

      const finalFileName = fileName || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(finalFileName);
      
      // Track report export usage
      await trackActionAction('report_exports', undefined, { fileName: finalFileName, title });
      
    } catch (error) {
      console.error('Error generating report PDF', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateReportPDF,
    isGenerating
  };
};
