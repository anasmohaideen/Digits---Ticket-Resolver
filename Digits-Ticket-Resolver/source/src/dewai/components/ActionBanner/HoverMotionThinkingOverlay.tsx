import motionStyles from './bannerHoverMotion.module.css'

/** Motion-only purple border shine during Summary banner thinking (not Quiet rainbow sweep). */
export function HoverMotionThinkingOverlay() {
  return (
    <div className={motionStyles.motionThinkingRoot} aria-hidden="true">
      <div className={motionStyles.motionThinkingRing} />
    </div>
  )
}
