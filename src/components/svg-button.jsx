import React from 'react';

export class SvgButton extends React.Component {
    render () {
        return (
            <a href="#" onClick={this.props.handleClick}>
            <svg class={this.props.svgClass} preserveAspectRatio="xMidYMid meet">
                <use xlinkHref={"./static/images/sprite-scan.svg#" + this.props.id}/>
            </svg>
            </a>
        )
    }
}
