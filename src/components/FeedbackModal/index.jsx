import React, { useState } from "react";
import { X } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export default function FeedbackModal({ 
  isVisible = true, 
  onClose, 
  onSubmit,
  sessionId 
}) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [goalAchieved, setGoalAchieved] = useState(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  if (!isVisible && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert(t("feedback.alert-rating-required"));
      return;
    }

    setIsSubmitting(true);

    const feedbackData = {
      session_id: sessionId,
      rating: rating,
      goal_achieved: goalAchieved,
      comment: comment.trim() || null,
      feedback_triggered_by: "AUTO_PROMPT",
      user_agent: navigator.userAgent
    };

    try {
      await onSubmit(feedbackData);
      setIsSubmitted(true);
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert(t("feedback.alert-error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  // Backdrop and container
  const backdropStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 999,
    opacity: isClosing ? 0 : 1,
    transition: 'opacity 0.3s ease'
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: isClosing 
      ? 'translate(-50%, -50%) translateY(10px)' 
      : 'translate(-50%, -50%) translateY(0)',
    width: '90%',
    maxWidth: '320px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.08)',
    padding: '12px 20px 20px',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    textAlign: 'center',
    zIndex: 1000,
    opacity: isClosing ? 0 : 1,
    transition: 'all 0.3s ease'
  };

  if (isSubmitted) {
    return (
      <>
        <div style={backdropStyle} onClick={handleClose} />
        <div style={modalStyle}>
          <div className="allm-w-16 allm-h-16 allm-mx-auto allm-mb-4 allm-rounded-full allm-flex allm-items-center allm-justify-center" 
               style={{ backgroundColor: '#003366' }}>
            <svg className="allm-w-8 allm-h-8 allm-text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="allm-text-lg allm-font-semibold allm-mb-2" style={{ color: '#222', letterSpacing: '0.3px' }}>
            {t("feedback.success-title")}
          </h3>
          <p className="allm-text-sm" style={{ color: '#666', letterSpacing: '0.3px' }}>
            {t("feedback.success-message")}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={backdropStyle} onClick={handleClose} />
      <div style={modalStyle}>
        {/* Header */}
        <div className="allm-relative" style={{ marginBottom: '16px' }}>
          <button
            onClick={handleClose}
            className="allm-absolute allm-transition-all"
            style={{ 
              top: '0',
              right: '0',
              color: '#aaa',
              fontSize: '16px',
              border: 'none',
              background: 'transparent',
              padding: '4px',
              cursor: 'pointer',
              transitionDuration: '0.2s',
              transitionTimingFunction: 'ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#555';
              e.currentTarget.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#aaa';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Close"
          >
            <X size={16} weight="bold" />
          </button>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 600, 
          color: '#222', 
          letterSpacing: '0.3px',
          marginBottom: '6px'
        }}>
          {t("feedback.title")}
        </h3>
        <p style={{ 
          fontSize: '13px', 
          fontWeight: 500,
          color: '#777', 
          letterSpacing: '0.3px',
          margin: 0
        }}>
          {t("feedback.subtitle")}
        </p>
      </div>

      {/* Star Rating */}
      <div style={{ marginBottom: '16px' }}>
        <div className="allm-flex allm-justify-center allm-gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= (hoveredRating || rating);
            return (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="allm-transition-all allm-p-0 allm-leading-none allm-bg-transparent allm-border-0"
                style={{
                  fontSize: '28px',
                  color: isActive ? '#e63946' : '#ddd',
                  opacity: isActive ? 1 : 0.6,
                  transform: star === hoveredRating ? 'scale(1.1)' : 'scale(1)',
                  transitionDuration: '0.2s',
                  transitionTimingFunction: 'ease',
                  cursor: 'pointer'
                }}
                aria-label={`${star} stars`}
              >
                ⭐
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Achievement */}
      <div style={{ marginBottom: '20px' }}>
        <p className="allm-mb-2" style={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#444',
          letterSpacing: '0.3px'
        }}>
          {t("feedback.goal-question")}
        </p>
        <div className="allm-flex allm-justify-center allm-gap-5">
          {[
            { value: "YES", emoji: "😊", labelKey: "goal-yes" },
            { value: "PARTIALLY", emoji: "😐", labelKey: "goal-partially" },
            { value: "NO", emoji: "😞", labelKey: "goal-no" }
          ].map(({ value, emoji, labelKey }) => {
            const label = t(`feedback.${labelKey}`);
            const isSelected = goalAchieved === value;
            return (
              <button
                key={value}
                onClick={() => setGoalAchieved(value)}
                className="allm-flex allm-flex-col allm-items-center allm-gap-1 allm-transition-all allm-bg-transparent allm-border-0"
                style={{
                  opacity: isSelected ? 1 : 0.7,
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transitionDuration: '0.2s',
                  transitionTimingFunction: 'ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
                title={label}
              >
                <span className="allm-text-3xl allm-leading-none">{emoji}</span>
                <span className="allm-text-xs" style={{ color: '#555', fontWeight: 500 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment */}
      <div style={{ marginBottom: '20px' }}>
        <label className="allm-block allm-text-left allm-mb-1.5" style={{ 
          fontSize: '13px', 
          color: '#777',
          fontWeight: 500
        }}>
          {t("feedback.comment-label")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("feedback.comment-placeholder")}
          maxLength={500}
          className="allm-w-full allm-resize-none allm-transition-all"
          style={{
            height: '70px',
            padding: '10px',
            fontSize: '14px',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '8px',
            letterSpacing: '0.3px',
            transitionDuration: '0.2s',
            transitionTimingFunction: 'ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#003366';
            e.target.style.boxShadow = '0 0 0 2px rgba(0, 51, 102, 0.1)';
            e.target.style.outline = 'none';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ddd';
            e.target.style.boxShadow = 'none';
          }}
        />
        {comment.length > 0 && (
          <p className="allm-text-xs allm-text-right allm-mt-1" style={{ color: '#999' }}>
            {comment.length}/500
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="allm-flex" style={{ gap: '10px' }}>
        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="allm-flex-1 allm-transition-all disabled:allm-opacity-50 disabled:allm-cursor-not-allowed"
          style={{
            height: '44px',
            fontSize: '15px',
            fontWeight: 500,
            color: '#444',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            letterSpacing: '0.3px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transitionProperty: 'all',
            transitionDuration: '0.2s',
            transitionTimingFunction: 'ease'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = '#f9f9f9';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {t("feedback.button-skip")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="allm-flex-1 allm-text-white allm-transition-all disabled:allm-opacity-50 disabled:allm-cursor-not-allowed"
          style={{
            height: '44px',
            fontSize: '15px',
            fontWeight: 500,
            backgroundColor: '#003366',
            border: 'none',
            borderRadius: '8px',
            letterSpacing: '0.3px',
            cursor: (isSubmitting || rating === 0) ? 'not-allowed' : 'pointer',
            transitionProperty: 'all',
            transitionDuration: '0.2s',
            transitionTimingFunction: 'ease'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && rating !== 0) {
              e.currentTarget.style.backgroundColor = '#0b4d94';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 51, 102, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#003366';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isSubmitting ? (
            <span className="allm-flex allm-items-center allm-justify-center allm-gap-2">
              <svg className="allm-animate-spin allm-h-4 allm-w-4" viewBox="0 0 24 24">
                <circle
                  className="allm-opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="allm-opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("feedback.button-submitting")}
            </span>
          ) : (
            t("feedback.button-submit")
          )}
        </button>
      </div>
    </div>
    </>
  );
}

