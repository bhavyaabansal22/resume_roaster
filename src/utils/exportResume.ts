import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { ImprovedResumeData } from '../types';

/**
 * Generate and download PDF version of the improved resume using jsPDF
 */
export async function downloadResumePDF(resume: ImprovedResumeData) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = 40;

  // Primary Dark Color
  const primaryColor = [15, 23, 42]; // slate-900
  const secondaryColor = [30, 58, 138]; // blue-900
  const bodyColor = [51, 65, 85]; // slate-700

  // Helper: check page space
  const checkNewPage = (needed: number) => {
    if (y + needed > 750) {
      doc.addPage();
      y = 40;
    }
  };

  // Header Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(resume.header.name || "Candidate Name", margin, y);
  y += 20;

  // Title
  if (resume.header.title) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(resume.header.title, margin, y);
    y += 16;
  }

  // Contact line
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const contacts = [
    resume.header.email,
    resume.header.phone,
    resume.header.location,
    resume.header.linkedin,
    resume.header.github,
    resume.header.portfolio
  ].filter(Boolean);

  if (contacts.length > 0) {
    const contactLine = contacts.join('  |  ');
    const lines = doc.splitTextToSize(contactLine, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 10;
  }

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Helper section header
  const addSectionHeader = (title: string) => {
    checkNewPage(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + 40, y);
    y += 12;
  };

  // Professional Summary
  if (resume.professionalSummary) {
    addSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);
    const summaryLines = doc.splitTextToSize(resume.professionalSummary, contentWidth);
    checkNewPage(summaryLines.length * 13);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 13 + 12;
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    addSectionHeader('Technical & Professional Skills');
    doc.setFontSize(9);
    resume.skills.forEach((group) => {
      checkNewPage(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const catText = `${group.category}: `;
      doc.text(catText, margin, y);

      const catWidth = doc.getTextWidth(catText);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);
      const itemsText = group.items.join(', ');
      const itemLines = doc.splitTextToSize(itemsText, contentWidth - catWidth);
      doc.text(itemLines[0] || '', margin + catWidth, y);
      
      if (itemLines.length > 1) {
        y += 12;
        const remainingLines = itemLines.slice(1);
        doc.text(remainingLines, margin + 10, y);
        y += (remainingLines.length - 1) * 12;
      }
      y += 14;
    });
    y += 4;
  }

  // Work Experience
  if (resume.experience && resume.experience.length > 0) {
    addSectionHeader('Work Experience');
    resume.experience.forEach((exp) => {
      checkNewPage(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(exp.role, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${exp.company}  |  ${exp.dates}`, pageWidth - margin, y, { align: 'right' });
      y += 14;

      if (exp.bulletPoints) {
        doc.setFontSize(9);
        doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);
        exp.bulletPoints.forEach((bullet) => {
          checkNewPage(18);
          doc.text('•', margin + 5, y);
          const bulletLines = doc.splitTextToSize(bullet, contentWidth - 20);
          doc.text(bulletLines, margin + 18, y);
          y += bulletLines.length * 12 + 3;
        });
      }
      y += 6;
    });
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    addSectionHeader('Key Projects');
    resume.projects.forEach((proj) => {
      checkNewPage(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(proj.title, margin, y);

      if (proj.techStack && proj.techStack.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Stack: ${proj.techStack.join(', ')}`, pageWidth - margin, y, { align: 'right' });
      }
      y += 14;

      if (proj.descriptionBullets) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);
        proj.descriptionBullets.forEach((bullet) => {
          checkNewPage(18);
          doc.text('•', margin + 5, y);
          const bulletLines = doc.splitTextToSize(bullet, contentWidth - 20);
          doc.text(bulletLines, margin + 18, y);
          y += bulletLines.length * 12 + 3;
        });
      }
      y += 6;
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    addSectionHeader('Education');
    resume.education.forEach((edu) => {
      checkNewPage(24);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const degreeText = `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;
      doc.text(degreeText, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${edu.institution} (${edu.dates})`, pageWidth - margin, y, { align: 'right' });
      y += 14;
    });
    y += 6;
  }

  // Certifications & Achievements
  if ((resume.certifications && resume.certifications.length > 0) || (resume.achievements && resume.achievements.length > 0)) {
    addSectionHeader('Certifications & Achievements');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);

    const combined = [...(resume.certifications || []), ...(resume.achievements || [])];
    combined.forEach((item) => {
      checkNewPage(16);
      doc.text('•', margin + 5, y);
      const itemLines = doc.splitTextToSize(item, contentWidth - 20);
      doc.text(itemLines, margin + 18, y);
      y += itemLines.length * 12 + 3;
    });
  }

  // Save PDF
  const cleanName = (resume.header.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${cleanName}_Improved_Resume.pdf`);
}

/**
 * Generate and download DOCX version of the improved resume using docx
 */
export async function downloadResumeDOCX(resume: ImprovedResumeData) {
  const children: any[] = [];

  // Header Name
  children.push(
    new Paragraph({
      text: resume.header.name || "Candidate Name",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
    })
  );

  // Title
  if (resume.header.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.header.title,
            bold: true,
            color: '2563EB',
            size: 24,
          }),
        ],
      })
    );
  }

  // Contact Info
  const contacts = [
    resume.header.email,
    resume.header.phone,
    resume.header.location,
    resume.header.linkedin,
    resume.header.github,
    resume.header.portfolio
  ].filter(Boolean);

  if (contacts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contacts.join('  |  '),
            color: '64748B',
            size: 18,
          }),
        ],
      })
    );
  }

  // Divider spacing
  children.push(new Paragraph({ text: '' }));

  // Helper Section Heading
  const addSectionHeading = (title: string) => {
    children.push(
      new Paragraph({
        text: title.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
      })
    );
  };

  // Summary
  if (resume.professionalSummary) {
    addSectionHeading('Professional Summary');
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.professionalSummary,
            size: 20,
          }),
        ],
      })
    );
    children.push(new Paragraph({ text: '' }));
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    addSectionHeading('Technical & Professional Skills');
    resume.skills.forEach((group) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${group.category}: `, bold: true, size: 20 }),
            new TextRun({ text: group.items.join(', '), size: 20 }),
          ],
        })
      );
    });
    children.push(new Paragraph({ text: '' }));
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    addSectionHeading('Work Experience');
    resume.experience.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role, bold: true, size: 22 }),
            new TextRun({ text: ` — ${exp.company} (${exp.dates})`, italics: true, color: '64748B', size: 20 }),
          ],
        })
      );

      if (exp.bulletPoints) {
        exp.bulletPoints.forEach((bullet) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: bullet, size: 20 })],
            })
          );
        });
      }
      children.push(new Paragraph({ text: '' }));
    });
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    addSectionHeading('Key Projects');
    resume.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.title, bold: true, size: 22 }),
            ...(proj.techStack && proj.techStack.length > 0
              ? [new TextRun({ text: ` [Stack: ${proj.techStack.join(', ')}]`, italics: true, color: '2563EB', size: 18 })]
              : []),
          ],
        })
      );

      if (proj.descriptionBullets) {
        proj.descriptionBullets.forEach((bullet) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: bullet, size: 20 })],
            })
          );
        });
      }
      children.push(new Paragraph({ text: '' }));
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    addSectionHeading('Education');
    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`, bold: true, size: 20 }),
            new TextRun({ text: ` — ${edu.institution} (${edu.dates})`, italics: true, size: 18 }),
          ],
        })
      );
    });
    children.push(new Paragraph({ text: '' }));
  }

  // Certifications & Achievements
  if ((resume.certifications && resume.certifications.length > 0) || (resume.achievements && resume.achievements.length > 0)) {
    addSectionHeading('Certifications & Achievements');
    const combined = [...(resume.certifications || []), ...(resume.achievements || [])];
    combined.forEach((item) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: item, size: 20 })],
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const cleanName = (resume.header.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
  link.href = url;
  link.download = `${cleanName}_Improved_Resume.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format resume into plain markdown text for easy clipboard copy
 */
export function formatResumeAsMarkdown(resume: ImprovedResumeData): string {
  let md = `# ${resume.header.name || "Candidate Name"}\n`;
  if (resume.header.title) md += `**${resume.header.title}**\n`;

  const contacts = [
    resume.header.email,
    resume.header.phone,
    resume.header.location,
    resume.header.linkedin,
    resume.header.github,
    resume.header.portfolio
  ].filter(Boolean);

  if (contacts.length > 0) md += `${contacts.join(' | ')}\n\n`;

  if (resume.professionalSummary) {
    md += `## PROFESSIONAL SUMMARY\n${resume.professionalSummary}\n\n`;
  }

  if (resume.skills && resume.skills.length > 0) {
    md += `## TECHNICAL & PROFESSIONAL SKILLS\n`;
    resume.skills.forEach((s) => {
      md += `- **${s.category}:** ${s.items.join(', ')}\n`;
    });
    md += `\n`;
  }

  if (resume.experience && resume.experience.length > 0) {
    md += `## WORK EXPERIENCE\n`;
    resume.experience.forEach((e) => {
      md += `### ${e.role} | ${e.company} (${e.dates})\n`;
      e.bulletPoints.forEach((b) => {
        md += `- ${b}\n`;
      });
      md += `\n`;
    });
  }

  if (resume.projects && resume.projects.length > 0) {
    md += `## KEY PROJECTS\n`;
    resume.projects.forEach((p) => {
      md += `### ${p.title} ${p.techStack ? `[${p.techStack.join(', ')}]` : ''}\n`;
      p.descriptionBullets.forEach((b) => {
        md += `- ${b}\n`;
      });
      md += `\n`;
    });
  }

  if (resume.education && resume.education.length > 0) {
    md += `## EDUCATION\n`;
    resume.education.forEach((edu) => {
      md += `- **${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}** - ${edu.institution} (${edu.dates})\n`;
    });
    md += `\n`;
  }

  if ((resume.certifications && resume.certifications.length > 0) || (resume.achievements && resume.achievements.length > 0)) {
    md += `## CERTIFICATIONS & ACHIEVEMENTS\n`;
    [...(resume.certifications || []), ...(resume.achievements || [])].forEach((item) => {
      md += `- ${item}\n`;
    });
  }

  return md;
}
