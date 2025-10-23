interface WidgetProps {
  eventBus: Emitter;
}

declare module 'notes_widget/Widget' {
  const Widget: React.ComponentType<WidgetProps>;
  export default Widget;
}

declare module 'analytics_widget/Widget' {
  const Widget: React.ComponentType<WidgetProps>;
  export default Widget;
}

declare module 'ai_chat/Widget' {
  const Widget: React.ComponentType<WidgetProps>;
  export default Widget;
}
